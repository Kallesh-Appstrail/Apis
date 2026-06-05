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
  const key = 'projects/demo-project/videos/1778384969921-62bc30a1-8b94-4a57-a1c2-051d1eb3c03a-WhatsApp-Video-2026-03-29-at-6.33.58-PM_hls/master.m3u8';
  try {
    console.log(`Checking if s3://${bucket}/${key} exists...`);
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    console.log('File EXISTS in S3!');
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      console.log('File does NOT EXIST (404 Not Found). This means MediaConvert did not create it or failed.');
    } else {
      console.error('Error checking S3:', err);
    }
  }
}

checkS3File();
