const { MediaConvertClient, CreateJobCommand } = require("@aws-sdk/client-mediaconvert");

function getMediaConvertClient() {
  const endpoint = process.env.MEDIACONVERT_ENDPOINT;
  const region = process.env.AWS_REGION || 'us-east-1';

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim();
  
  let credentials;
  if (accessKeyId && secretAccessKey) {
    credentials = { accessKeyId, secretAccessKey };
    if (sessionToken) credentials.sessionToken = sessionToken;
  }

  return new MediaConvertClient({
    region,
    endpoint,
    credentials,
  });
}

/**
 * Creates an HLS Transcoding Job in AWS MediaConvert
 * @param {string} inputKey - The S3 object key of the input file
 * @param {string} outputFolder - The S3 folder key for the output HLS files
 */
async function createHLSJob(inputKey, outputFolder) {
  const role = process.env.MEDIACONVERT_ROLE_ARN;
  const bucket = process.env.S3_BUCKET;

  if (!role || !bucket) {
    console.warn("Skipping MediaConvert Job: MEDIACONVERT_ROLE_ARN or S3_BUCKET missing in .env");
    return null;
  }

  const client = getMediaConvertClient();

  const inputS3Url = `s3://${bucket}/${inputKey}`;
  const outputS3Url = `s3://${bucket}/${outputFolder}/master`;

  const params = {
    Role: role,
    Settings: {
      Inputs: [
        {
          FileInput: inputS3Url,
          AudioSelectors: {
            "Audio Selector 1": {
              DefaultSelection: "DEFAULT",
            },
          },
        },
      ],
      OutputGroups: [
        {
          Name: "HLS Group",
          OutputGroupSettings: {
            Type: "HLS_GROUP_SETTINGS",
            HlsGroupSettings: {
              Destination: outputS3Url,
              SegmentLength: 10,
              MinSegmentLength: 0,
            },
          },
          Outputs: [
            {
              NameModifier: "_1080p",
              ContainerSettings: { Container: "M3U8" },
              VideoDescription: {
                Width: 1920,
                Height: 1080,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 5000000 },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: { Bitrate: 96000, CodingMode: "CODING_MODE_2_0", SampleRate: 48000 },
                  },
                },
              ],
            },
            {
              NameModifier: "_720p",
              ContainerSettings: { Container: "M3U8" },
              VideoDescription: {
                Width: 1280,
                Height: 720,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 3000000 },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: { Bitrate: 96000, CodingMode: "CODING_MODE_2_0", SampleRate: 48000 },
                  },
                },
              ],
            },
            {
              NameModifier: "_360p",
              ContainerSettings: { Container: "M3U8" },
              VideoDescription: {
                Width: 640,
                Height: 360,
                CodecSettings: {
                  Codec: "H_264",
                  H264Settings: { RateControlMode: "QVBR", MaxBitrate: 1000000 },
                },
              },
              AudioDescriptions: [
                {
                  AudioSourceName: "Audio Selector 1",
                  CodecSettings: {
                    Codec: "AAC",
                    AacSettings: { Bitrate: 96000, CodingMode: "CODING_MODE_2_0", SampleRate: 48000 },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  };

  try {
    const command = new CreateJobCommand(params);
    const response = await client.send(command);
    return response.Job;
  } catch (error) {
    console.error("Error creating MediaConvert Job:", error);
    throw error;
  }
}

module.exports = { createHLSJob };
