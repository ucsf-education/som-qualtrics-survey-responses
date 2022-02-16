'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { getSurveyResponses } = require('./src/get-survey-responses');
const { getSurveyResponseSchema } = require('./src/get-survey-response-schema');
const { getSurveyDetails } = require('./src/get-survey-details');

const surveyId = process.argv[2];
const dir = path.join(__dirname, 'output');
fs.mkdirSync(dir, { recursive: true });

const csvFilePath = path.join(dir, `${surveyId}.csv`);
const csvDestinationStream = fs.createWriteStream(csvFilePath);
const csvPromise = getSurveyResponses(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  csvDestinationStream,
  'csv'
);

const jsonResponseFilePath = path.join(dir, `${surveyId}-responses.json`);
const jsonResponseDestinationStream = fs.createWriteStream(jsonResponseFilePath);
const jsonResponsePromise = getSurveyResponses(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonResponseDestinationStream,
  'json'
);

const jsonDetailsFilePath = path.join(dir, `${surveyId}-survey.json`);
const jsonDetailsDestinationStream = fs.createWriteStream(jsonDetailsFilePath);
const jsonDetailsPromise = getSurveyDetails(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonDetailsDestinationStream
);

const jsonSchemaFilePath = path.join(dir, `${surveyId}-schema.json`);
const jsonSchemaDestinationStream = fs.createWriteStream(jsonSchemaFilePath);
const jsonSchemaPromise = getSurveyResponseSchema(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonSchemaDestinationStream
);
console.log([jsonResponsePromise, jsonDetailsPromise, jsonSchemaPromise, csvPromise]);

process.stdout.write('working...');
try {
  Promise.all([jsonResponsePromise, jsonDetailsPromise, jsonSchemaPromise, csvPromise]).then(() => {
    process.stdout.write('done\n');
  });
} catch (e) {
  process.stderr.write('nope');
  process.stderr.write(e);
}
