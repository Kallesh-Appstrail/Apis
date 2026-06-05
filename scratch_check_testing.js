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
  const key = 'projects/demo-project/videos/1778387395242-cb363fec-c268-43f0-91c5-6914737196d1-Testing_hls/master.m3u8';
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log('Testing file EXISTS in S3!');
  } catch (err) {
    console.log('Testing file ERROR:', err.$metadata?.httpStatusCode, err.name);
  }
}

checkS3File();
