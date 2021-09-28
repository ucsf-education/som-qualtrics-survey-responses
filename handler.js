'use strict';
const fs = require('fs');
const { getSurveyResults } = require('./src/get-survey-results');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.storeSurveys = async event => {
  const ids = process.env.SURVEY_IDS.split(',').filter(id => {
    //filter out empty "\n" string values
    return Boolean(id) && typeof id === 'string' && id.length > 5;
  });
  console.log('Processing Survey Ids: ', ids);
  const promises = ids.map(id => storeSurvey(id.trim()));
  const results = await Promise.all(promises);
  return { message: results.join(', '), event };
};

const storeSurvey = async (surveyId) => {
  await Promise.all([
    storeSurveyType(surveyId, 'json'),
    storeSurveyType(surveyId, 'csv'),
  ]);
  return `Stored ${surveyId}`;
};

const storeSurveyType = async (surveyId, type) => {
  console.log(`getting data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}.${type}`;
  const destinationStream = fs.createWriteStream(fileName);
  await getSurveyResults(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
    type
  );

  console.log(`survey data extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}.${type}`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}.${type}`,
    Body: fs.createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};
