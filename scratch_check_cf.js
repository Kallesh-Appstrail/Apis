require('dotenv').config();
const { CloudFrontClient, GetDistributionConfigCommand } = require('@aws-sdk/client-cloudfront');

const client = new CloudFrontClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function checkCF() {
  try {
    const res = await client.send(new GetDistributionConfigCommand({ Id: 'E1VW8KF1QF5S8P' }));
    const behavior = res.DistributionConfig.DefaultCacheBehavior;
    console.log('Forwarded Values:', JSON.stringify(behavior.ForwardedValues, null, 2));
    console.log('CachePolicyId:', behavior.CachePolicyId);
    console.log('OriginRequestPolicyId:', behavior.OriginRequestPolicyId);
    console.log('Origin:', JSON.stringify(res.DistributionConfig.Origins, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

checkCF();
