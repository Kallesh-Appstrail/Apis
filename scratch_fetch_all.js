const https = require('https');

function test(url) {
  https.get(url, (res) => {
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    console.log('---');
  });
}

test('https://dh8vby4alcwq5.cloudfront.net/projects/demo-project/videos/1778386930086-84c6d243-b25a-4de4-bc62-775c3e0e75f7-WhatsApp-Video-2026-03-29-at-6.33.58-PM_hls/master.m3u8');
test('https://dh8vby4alcwq5.cloudfront.net/projects/demo-project/videos/1778387395242-cb363fec-c268-43f0-91c5-6914737196d1-Testing_hls/master.m3u8');
