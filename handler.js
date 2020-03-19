'use strict';
const fs = require('fs');
const { getSurveyResults } = require('./src/get-survey-results');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.storeSurvey = async event => {
  const surveyId = process.env.SURVEY_ID;
  console.log(`getting data for survey: ${surveyId}`);
  const fileName = `/tmp/${surveyId}.csv`;
  const destinationStream = fs.createWriteStream(fileName);
  await getSurveyResults(
    process.env.QUALTRICS_API_TOKEN,
    process.env.QUALTRICS_DATA_CENTER,
    surveyId,
    destinationStream
  );

  return destinationStream.on('finish', async () => {
    console.log(`survey data extracted, writing to S3 bucket ${process.env.BUCKET} ${surveyId}.csv`);
    const params = {
      Bucket: process.env.BUCKET,
      Key: `${surveyId}.csv`,
      Body: fs.createReadStream(fileName)
    };
    await s3.upload(params).promise();
    console.log('done!');
    return { message: `Stored ${surveyId}`, event };
  });
};
