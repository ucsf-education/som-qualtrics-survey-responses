'use strict';
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { getSurveyResults } = require('./src/get-survey-results');

const surveyId = process.argv[2];
const dir = path.join(__dirname, 'output');
if (!fs.existsSync(dir)){
  fs.mkdirSync(dir);
}

const filePath = path.join(dir, `${surveyId}.csv`);
const destinationStream = fs.createWriteStream(filePath);
getSurveyResults(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  destinationStream
).then(() => {
  console.log("done\n\n");
});
