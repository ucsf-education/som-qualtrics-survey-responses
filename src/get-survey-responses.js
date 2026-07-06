import { Buffer } from 'node:buffer';
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

  logger.addEvent('data: ' + JSON.stringify(data));

  return data.result.id;
}

async function waitForBuildToComplete(token, dataCenter, progressId, logger) {
  await sleep(1000); //wait for a second before making the request
  const url = `https://${dataCenter}.qualtrics.com/API/v3/responseexports/${progressId}`;
  const response = await fetch(url, {
    headers: {
      'x-api-token': token,
      'content-type': 'application/json'
    }
  });
  const data = await response.json();
  if (
    data.result.percentComplete === 100 &&
    data.result.status === 'complete' &&
    data.result.file
  ) {
    logger.addEvent('Build complete: ' + JSON.stringify(data));
    return data.result.file;
  }
  return waitForBuildToComplete(token, dataCenter, progressId, logger);
}

async function writeFile(token, url, destinationStream, logger) {
  logger.addEvent(`Writing file`);
  const response = await fetch(url, {
    headers: {
      'x-api-token': token,
      'content-type': 'application/json'
    }
  });
  const buffer = Buffer.from(await response.arrayBuffer());
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
  const fileUrl = await waitForBuildToComplete(token, dataCenter, progressId, logger);
  return await writeFile(token, fileUrl, destinationStream, logger);
}
