import 'dotenv/config';
import { createWriteStream, mkdirSync  } from 'node:fs';
import { Logger } from './src/logger.js';
import { getSurveyDetails } from './src/get-survey-details.js';
import { getSurveyResponseSchema } from './src/get-survey-response-schema.js';
import { getSurveyResponses } from './src/get-survey-responses.js';
import { join } from 'node:path';

const surveyId = process.argv[2];
const output = new URL('./output', import.meta.url);
mkdirSync(output, { recursive: true });
const dir = output.pathname;

const logger = new Logger();

process.stdout.write('working...');
try {
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
  const jsonDetailsPromise = getSurveyDetails(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    jsonDetailsFilePath,
    logger,
  );
  const jsonSchemaFilePath = join(dir, `${surveyId}-schema.json`);
  const jsonSchemaPromise = getSurveyResponseSchema(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    jsonSchemaFilePath,
    logger,
  );
  await Promise.all([
    jsonResponsePromise,
    jsonDetailsPromise,
    jsonSchemaPromise,
    csvPromise
  ]);

  process.stdout.write("\n");
  process.stdout.write("\ndone\n");
} catch (e) {
  process.stderr.write("nope");
  process.stdout.write("\n");
  process.stderr.write(logger.getEvents().join("\n"));
  console.log(e);
}
