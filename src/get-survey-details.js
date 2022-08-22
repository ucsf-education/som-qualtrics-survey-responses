import fetch from 'node-fetch';
import { writeFileSync } from 'node:fs';

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

export async function getSurveyDetails(token, dataCenter, surveyId, destinationPath, logger) {
  const data = await loadData(token, dataCenter, surveyId, logger);
  if (data) {
    logger.addEvent(`Writing file data to ${destinationPath}`);
    writeFileSync(destinationPath, data);
    logger.addEvent(`Finished Wrting Data to ${destinationPath}`);
  } else {
    logger.addEvent(`No details found for ${surveyId}`);
    writeFileSync(destinationPath, 'No data was returned');
  }
}
