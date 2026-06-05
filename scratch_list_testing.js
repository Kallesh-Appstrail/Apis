require('dotenv').config();
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function listFiles() {
  const bucket = process.env.S3_BUCKET;
  try {
    const res = await client.send(new ListObjectsV2Command({ 
      Bucket: bucket, 
      Prefix: 'projects/demo-project/videos/1778387395242-cb363fec-c268-43f0-91c5-6914737196d1-Testing' 
    }));
    if (res.Contents) {
      res.Contents.forEach(obj => console.log(obj.Key));
    } else {
      console.log('No objects found with that prefix');
    }
  } catch (err) {
    console.log('Error:', err);
  }
}

listFiles();
