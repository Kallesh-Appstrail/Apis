const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { getFileCategory } = require('../lib/fileCategory');
const { sanitizeSegment, sanitizeFilename } = require('../lib/sanitize');
const { v4: uuidv4 } = require('uuid');
const { createHLSJob } = require('./mediaConvertService');

const region = process.env.AWS_REGION || 'us-east-1';
const bucket = process.env.S3_BUCKET;
const publicBase = (process.env.S3_PUBLIC_BASE_URL || '').replace(/\/$/, '');
const presignedExpires = Number(process.env.PRESIGNED_GET_EXPIRES || 3600);

/**
 * Static keys from .env (local dev or small deployments).
 * If either access key id or secret is missing, credentials are omitted and the
 * SDK uses the default chain (~/.aws/credentials, AWS_PROFILE, EC2/Lambda role, etc.).
 */
function resolveCredentials() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim();
  if (accessKeyId && secretAccessKey) {
    const creds = { accessKeyId, secretAccessKey };
    if (sessionToken) creds.sessionToken = sessionToken;
    return creds;
  }
  return undefined;
}

const client = new S3Client({
  region,
  credentials: resolveCredentials(),
});

function assertBucket() {
  if (!bucket) {
    const err = new Error('S3_BUCKET is not configured');
    err.statusCode = 500;
    throw err;
  }
}

function buildObjectKey(projectId, category, safeFilename) {
  const pid = sanitizeSegment(projectId);
  const cat = sanitizeSegment(category, { maxLength: 64 });
  const stamp = Date.now();
  const id = uuidv4();
  const name = sanitizeFilename(safeFilename);
  return `projects/${pid}/${cat}/${stamp}-${id}-${name}`;
}

async function uploadBuffer({ projectId, buffer, mimetype, originalname }) {
  assertBucket();
  const category = getFileCategory(mimetype, originalname);
  const key = buildObjectKey(projectId, category, originalname);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype || 'application/octet-stream',
    })
  );

  const accessUrl = await resolveAccessUrl(key);
  let streamUrl = undefined;

  if (category === 'videos') {
    try {
      const baseKey = key.includes('.') ? key.substring(0, key.lastIndexOf('.')) : key;
      const hlsFolder = `${baseKey}_hls`;
      await createHLSJob(key, hlsFolder);
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      if (cloudFrontDomain) {
        streamUrl = `https://${cloudFrontDomain}/${hlsFolder}/master.m3u8`;
      } else {
        streamUrl = `https://${bucket}.s3.${region}.amazonaws.com/${hlsFolder}/master.m3u8`;
      }
    } catch (err) {
      console.error("Failed to start MediaConvert job:", err);
    }
  }

  return {
    key,
    bucket,
    category,
    contentType: mimetype || 'application/octet-stream',
    size: buffer.length,
    originalName: originalname,
    url: accessUrl,
    streamUrl,
  };
}

function publicUrlForKey(key) {
  const encodedPath = key.split('/').map(encodeURIComponent).join('/');
  return `${publicBase}/${encodedPath}`;
}

async function resolveAccessUrl(key) {
  if (publicBase) {
    return publicUrlForKey(key);
  }
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: presignedExpires });
}

/**
 * Presigned GET for an existing object key (must belong to project prefix).
 */
async function getPresignedGetUrl(projectId, key) {
  assertBucket();
  const pid = sanitizeSegment(projectId);
  const prefix = `projects/${pid}/`;
  if (!key || !key.startsWith(prefix)) {
    const err = new Error('Key does not belong to this project');
    err.statusCode = 400;
    throw err;
  }
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  } catch (e) {
    const code = e.$metadata?.httpStatusCode;
    if (e.name === 'NotFound' || code === 404) {
      const err = new Error('Object not found');
      err.statusCode = 404;
      throw err;
    }
    throw e;
  }
  return resolveAccessUrl(key);
}

module.exports = {
  uploadBuffer,
  getPresignedGetUrl,
  getFileCategory,
};
