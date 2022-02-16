'use strict';
const fetch = require('node-fetch');

async function loadData (token, dataCenter, surveyId) {
  const url = `https://${dataCenter}.qualtrics.com/API/v3/survey-definitions/${surveyId}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-api-token': token
    }
  });
  const data = await response.json();

  return JSON.stringify(data.result);
}

async function writeFile (data, destinationStream) {
  destinationStream.write(data);
  return new Promise(resolve => {
    destinationStream.on('finish', () => {
      resolve();
    });
  });
}

async function getSurveyDetails (token, dataCenter, surveyId, destinationStream) {
  const data = await loadData(token, dataCenter, surveyId);
  return await writeFile(data, destinationStream);
}

exports.getSurveyDetails = getSurveyDetails;
