'use strict';
const fs = require('fs');
const { getSurveyResponses } = require('./src/get-survey-responses');
const { getSurveyResponseSchema } = require('./src/get-survey-response-schema');
const { getSurveyDetails } = require('./src/get-survey-details');
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
  try {
    await Promise.all([
      storeSurveyResponses(surveyId),
      storeSurveyResponseSchema(surveyId),
      storeSurveyDetails(surveyId),
      storeCSVSurvey(surveyId),
    ]);
    return `Stored ${surveyId}`;
  } catch (e) {
    console.log(`Error fetching: ${surveyId}`);
    console.log(e);
  }
};

const storeCSVSurvey = async (surveyId) => {
  console.log(`getting csv response data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}.csv`;
  const destinationStream = fs.createWriteStream(fileName);
  await getSurveyResponses(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
    'csv'
  );

  console.log(`csv response data extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}.csv`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}.csv`,
    Body: fs.createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};

const storeSurveyResponses = async (surveyId) => {
  console.log(`getting response data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-responses.json`;
  const destinationStream = fs.createWriteStream(fileName);
  await getSurveyResponses(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
    'json'
  );

  console.log(`response data extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}-responses.json`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}-responses.json`,
    Body: fs.createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};

const storeSurveyResponseSchema = async (surveyId) => {
  console.log(`getting schema for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-schema.json`;
  const destinationStream = fs.createWriteStream(fileName);
  await getSurveyResponseSchema(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
  );

  console.log(`schema extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}-schema.json`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}-schema.json`,
    Body: fs.createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};

const storeSurveyDetails = async (surveyId) => {
  console.log(`getting details for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-survey.json`;
  const destinationStream = fs.createWriteStream(fileName);
  await getSurveyDetails(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
  );

  console.log(`details extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}-survey.json`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}-survey.json`,
    Body: fs.createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};
