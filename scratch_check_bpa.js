require('dotenv').config();
const { S3Client, GetPublicAccessBlockCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function checkBPA() {
  const bucket = process.env.S3_BUCKET;
  try {
    const res = await client.send(new GetPublicAccessBlockCommand({ Bucket: bucket }));
    console.log(JSON.stringify(res.PublicAccessBlockConfiguration, null, 2));
  } catch (err) {
    if (err.name === 'NoSuchPublicAccessBlockConfiguration') {
      console.log('No Public Access Block Configuration found (means it is NOT blocked at bucket level)');
    } else {
      console.error('Error:', err);
    }
  }
}

checkBPA();
