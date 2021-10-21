import fetch from 'node-fetch';

async function loadData(token, dataCenter, surveyId, logger) {
  const url = `https://${dataCenter}.qualtrics.com/API/v3/survey-definitions/${surveyId}`;
  logger.addEvent(`Fetching from: ${url}`);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-token': token,
    }
  });
  const data = await response.json();

  return JSON.stringify(data.result);
}

async function writeFile(data, destinationStream, logger) {
  logger.addEvent(`Writing file data`);
  destinationStream.write(data);
  return new Promise(resolve => {
    destinationStream.on("finish", () => {
      resolve();
    });
  });
}

export async function getSurveyDetails(token, dataCenter, surveyId, destinationStream, logger) {
  const data = await loadData(token, dataCenter, surveyId, logger);
  return await writeFile(data, destinationStream, logger);
}
