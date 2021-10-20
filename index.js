'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { getSurveyResponses } = require('./src/get-survey-responses');

const surveyId = process.argv[2];
const dir = path.join(__dirname, 'output');
fs.mkdirSync(dir, { recursive: true });

const jsonFilePath = path.join(dir, `${surveyId}-responses.json`);
const jsonDestinationStream = fs.createWriteStream(jsonFilePath);
const jsonPromise = getSurveyResponses(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonDestinationStream,
  'json'
);

const csvFilePath = path.join(dir, `${surveyId}.csv`);
const csvDestinationStream = fs.createWriteStream(csvFilePath);
const csvPromise = getSurveyResponses(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  csvDestinationStream,
  'csv'
);

Promise.all([jsonPromise, csvPromise]).then(() => {
  console.log("done\n");
});
