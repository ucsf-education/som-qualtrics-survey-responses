'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { getSurveyResults } = require('./src/get-survey-results');

const surveyId = process.argv[2];
const dir = path.join(__dirname, 'output');
fs.mkdirSync(dir, { recursive: true });

const jsonFilePath = path.join(dir, `${surveyId}.json`);
const jsonDestinationStream = fs.createWriteStream(jsonFilePath);
const jsonPromise = getSurveyResults(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonDestinationStream,
  'json'
);

const csvFilePath = path.join(dir, `${surveyId}.csv`);
const csvDestinationStream = fs.createWriteStream(csvFilePath);
const csvPromise = getSurveyResults(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  csvDestinationStream,
  'csv'
);

Promise.all([jsonPromise, csvPromise]).then(() => {
  console.log("done\n");
});
