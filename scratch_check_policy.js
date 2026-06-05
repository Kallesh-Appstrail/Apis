require('dotenv').config();
const { S3Client, GetBucketPolicyCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function checkPolicy() {
  const bucket = process.env.S3_BUCKET;
  try {
    const res = await client.send(new GetBucketPolicyCommand({ Bucket: bucket }));
    console.log(res.Policy);
  } catch (err) {
    console.error('Error:', err);
  }
}

checkPolicy();
