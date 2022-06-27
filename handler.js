import { createReadStream, createWriteStream } from 'node:fs';
import AWS from 'aws-sdk';
import { getSurveyDetails } from './src/get-survey-details.js';
import { getSurveyResponseSchema } from './src/get-survey-response-schema.js';
import { getSurveyResponses } from './src/get-survey-responses.js';

const s3 = new AWS.S3();

export async function storeSurveys(event) {
  const ids = process.env.SURVEY_IDS.split(',').filter(id => {
    //filter out empty "\n" string values
    return Boolean(id) && typeof id === 'string' && id.length > 5;
  });
  console.log('Processing Survey Ids: ', ids);
  const promises = ids.map(id => storeSurvey(id.trim()));
  const results = await Promise.all(promises);
  return { message: results.join(', '), event };
}

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
  const destinationStream = createWriteStream(fileName);
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
    Body: createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};

const storeSurveyResponses = async (surveyId) => {
  console.log(`getting response data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-responses.json`;
  const destinationStream = createWriteStream(fileName);
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
    Body: createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};

const storeSurveyResponseSchema = async (surveyId) => {
  console.log(`getting schema for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-schema.json`;
  const destinationStream = createWriteStream(fileName);
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
    Body: createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};

const storeSurveyDetails = async (surveyId) => {
  console.log(`getting details for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-survey.json`;
  const destinationStream = createWriteStream(fileName);
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
    Body: createReadStream(fileName)
  };
  await s3.upload(params).promise();
  console.log('done!');
};
