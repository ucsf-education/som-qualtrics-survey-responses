import 'dotenv/config';
import { createWriteStream, mkdirSync  } from 'node:fs';
import { Logger } from './src/logger';
import { getSurveyDetails } from './src/get-survey-details.js';
import { getSurveyResponseSchema } from './src/get-survey-response-schema.js';
import { getSurveyResponses } from './src/get-survey-responses.js';
import { join } from 'node:path';

const surveyId = process.argv[2];
const output = new URL('./output', import.meta.url);
mkdirSync(output, { recursive: true });
const dir = output.pathname;

const logger = new Logger();
const csvFilePath = join(dir, `${surveyId}.csv`);
const csvDestinationStream = createWriteStream(csvFilePath);
const csvPromise = getSurveyResponses(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  csvDestinationStream,
  'csv',
  logger
);

const jsonResponseFilePath = join(dir, `${surveyId}-responses.json`);
const jsonResponseDestinationStream = createWriteStream(jsonResponseFilePath);
const jsonResponsePromise = getSurveyResponses(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonResponseDestinationStream,
  'json',
  logger,
);

const jsonDetailsFilePath = join(dir, `${surveyId}-survey.json`);
const jsonDetailsDestinationStream = createWriteStream(jsonDetailsFilePath);
const jsonDetailsPromise = getSurveyDetails(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonDetailsDestinationStream,
  logger,
);

const jsonSchemaFilePath = join(dir, `${surveyId}-schema.json`);
const jsonSchemaDestinationStream = createWriteStream(jsonSchemaFilePath);
const jsonSchemaPromise = getSurveyResponseSchema(
  process.env.QUALTRICS_API_TOKEN,
  process.env.QUALTRICS_DATA_CENTER,
  surveyId,
  jsonSchemaDestinationStream,
  logger,
);
process.stdout.write('working...');
try {
  Promise.all([jsonResponsePromise, jsonDetailsPromise, jsonSchemaPromise, csvPromise]).then(() => {
    process.stdout.write("done\n");
  });
} catch (e) {
  process.stderr.write("nope");
  process.stderr.write(e);
  process.stderr.write(logger.getEvents().join("\n"));
}
