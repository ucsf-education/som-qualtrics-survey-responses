import { createReadStream, createWriteStream } from 'node:fs';
import { Logger } from './src/logger.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { getSurveyDetails } from './src/get-survey-details.js';
import { getSurveyResponseSchema } from './src/get-survey-response-schema.js';
import { getSurveyResponses } from './src/get-survey-responses.js';

//create the client outside of the handler:
//https://github.com/aws/aws-sdk-js-v3?tab=readme-ov-file#best-practices
const s3Client = new S3Client({});

export async function storeSurveys(event) {
  const ids = process.env.SURVEY_IDS.split(',').filter(id => {
    //filter out empty "\n" string values
    return Boolean(id) && typeof id === 'string' && id.length > 5;
  });
  console.log('Processing Survey Ids: ', ids);

  const loggers = [];
  for (const id of ids) {
    loggers.push(await storeSurvey(id.trim()));
  }
  const output = loggers.map(logger => logger?.getEvents());
  console.log(output);
  return { message: output, event };
}

const storeSurvey = async (surveyId) => {
  const logger = new Logger();
  try {
    await storeSurveyResponses(surveyId, logger);
    await storeSurveyResponseSchema(surveyId, logger);
    await storeSurveyDetails(surveyId, logger);
    await storeCSVSurvey(surveyId, logger);
    logger.addEvent(`Stored ${surveyId}`);
    return logger;
  } catch (e) {
    console.log(`Error fetching: ${surveyId}`);
    console.log(e);
    console.log(logger.getEvents());
  }
};

const storeCSVSurvey = async (surveyId, logger) => {
  logger.addEvent(`getting csv response data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}.csv`;
  const destinationStream = createWriteStream(fileName);
  await getSurveyResponses(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
    'csv',
    logger,
  );

  logger.addEvent(`csv response data extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}.csv`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}.csv`,
    Body: createReadStream(fileName)
  };
  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  logger.addEvent('done!');
};

const storeSurveyResponses = async (surveyId, logger) => {
  logger.addEvent(`getting response data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-responses.json`;
  const destinationStream = createWriteStream(fileName);
  await getSurveyResponses(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream,
    'json',
    logger,
  );

  logger.addEvent(`response data extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}-responses.json`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}-responses.json`,
    Body: createReadStream(fileName)
  };
  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  logger.addEvent('done!');
};

const storeSurveyResponseSchema = async (surveyId, logger) => {
  logger.addEvent(`getting schema for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-schema.json`;
  await getSurveyResponseSchema(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    fileName,
    logger,
  );

  logger.addEvent(`schema extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}-schema.json`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}-schema.json`,
    Body: createReadStream(fileName)
  };
  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  logger.addEvent('done!');
};

const storeSurveyDetails = async (surveyId, logger) => {
  logger.addEvent(`getting details for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}-survey.json`;
  await getSurveyDetails(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    fileName,
    logger,
  );

  logger.addEvent(`details extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}-survey.json`);
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${surveyId}-survey.json`,
    Body: createReadStream(fileName)
  };
  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  logger.addEvent('done!');
};
