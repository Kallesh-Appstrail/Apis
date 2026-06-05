require('dotenv').config();
const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function checkS3File() {
  const bucket = process.env.S3_BUCKET;
  const key = 'projects/demo-project/videos/1778386980622-d2e0773d-2978-4f8a-8d0e-ac70dacd4105-8-STREET-FIGHT-Lies-That-Get-MEN-Hurt...-Don-t-Fall-For-These-Fight-SCIENCE-1080p-h264-_hls/master.m3u8';
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log('File 2 EXISTS in S3!');
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404 || err.$metadata?.httpStatusCode === 403) {
      console.log('File 2 does NOT EXIST in S3 (Status ' + err.$metadata?.httpStatusCode + '). MediaConvert probably failed or is still running.');
    } else {
      console.error('Error:', err);
    }
  }
}

checkS3File();
