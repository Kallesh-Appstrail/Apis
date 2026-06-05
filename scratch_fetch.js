const https = require('https');
https.get('https://dh8vby4alcwq5.cloudfront.net/projects/demo-project/videos/1778384969921-62bc30a1-8b94-4a57-a1c2-051d1eb3c03a-WhatsApp-Video-2026-03-29-at-6.33.58-PM_hls/master.m3u8?refresh=10', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  res.on('data', d => process.stdout.write(d));
});
