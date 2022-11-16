import fetch from 'node-fetch';
import { sleep } from './sleep.js';
import yauzl from 'yauzl-promise';

async function requestResultsToBeBuilt(token, dataCenter, surveyId, format, logger) {
  const payload = {
    format,
    surveyId
  };
  const url = `https://${dataCenter}.qualtrics.com/API/v3/responseexports`;
  logger.addEvent(`Fetching from: ${url}`);
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'x-api-token': token,
      'content-type': 'application/json'
    }
  });
  logger.addEvent('fetched');
  const data = await response.json();

  return data.result.id;
}

async function waitForBuildToComplete(token, dataCenter, progressId) {
  await sleep(1000); //wait for a second before making the request
  const url = `https://${dataCenter}.qualtrics.com/API/v3/responseexports/${progressId}`;
  const response = await fetch(url, {
    headers: {
      'x-api-token': token,
      'content-type': 'application/json'
    }
  });
  const data = await response.json();
  if (data.result.percentComplete === 100) {
    return data.result.file;
  }
  return waitForBuildToComplete(token, dataCenter, progressId);
}

async function writeFile(token, url, destinationStream, logger) {
  logger.addEvent(`Writing file`);
  const response = await fetch(url, {
    headers: {
      'x-api-token': token,
      'content-type': 'application/json'
    }
  });
  const buffer = await response.buffer();
  const zipFile = await yauzl.fromBuffer(buffer);
  const entry = await zipFile.readEntry();
  const readStream = await zipFile.openReadStream(entry);
  readStream.pipe(destinationStream);
  return new Promise(resolve => {
    destinationStream.on("finish", () => {
      resolve();
    });
  });
}

export async function getSurveyResponses(token, dataCenter, surveyId, destinationStream, format, logger) {
  const progressId = await requestResultsToBeBuilt(token, dataCenter, surveyId, format, logger);
  const fileUrl = await waitForBuildToComplete(token, dataCenter, progressId);
  return await writeFile(token, fileUrl, destinationStream, logger);
}
