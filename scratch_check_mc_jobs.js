require('dotenv').config();
const { MediaConvertClient, ListJobsCommand } = require('@aws-sdk/client-mediaconvert');

const client = new MediaConvertClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.MEDIACONVERT_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function checkJobs() {
  try {
    const res = await client.send(new ListJobsCommand({ MaxResults: 5, Order: 'DESCENDING' }));
    res.Jobs.forEach(job => {
      console.log(`Job ID: ${job.Id}`);
      console.log(`Status: ${job.Status}`);
      console.log(`Error: ${job.ErrorMessage || 'None'}`);
      const input = job.Settings?.Inputs?.[0]?.FileInput;
      console.log(`Input: ${input}`);
      console.log('---');
    });
  } catch (err) {
    console.log('Error:', err);
  }
}

checkJobs();
