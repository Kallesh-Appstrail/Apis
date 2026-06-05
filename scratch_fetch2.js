const https = require('https');
https.get('https://dh8vby4alcwq5.cloudfront.net/projects/demo-project/videos/1778386980622-d2e0773d-2978-4f8a-8d0e-ac70dacd4105-8-STREET-FIGHT-Lies-That-Get-MEN-Hurt...-Don-t-Fall-For-These-Fight-SCIENCE-1080p-h264-_hls/master.m3u8', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  res.on('data', d => process.stdout.write(d));
});
