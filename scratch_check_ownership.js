require('dotenv').config();
const { S3Client, GetBucketOwnershipControlsCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function checkOwnership() {
  const bucket = process.env.S3_BUCKET;
  try {
    const res = await client.send(new GetBucketOwnershipControlsCommand({ Bucket: bucket }));
    console.log(JSON.stringify(res.OwnershipControls, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

checkOwnership();
