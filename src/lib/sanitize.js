const path = require('path');

/**
 * Safe path segment for S3 keys (project id, folder names).
 */
function sanitizeSegment(input, { maxLength = 128 } = {}) {
  if (input == null || String(input).trim() === '') {
    throw new Error('Segment cannot be empty');
  }
  let s = String(input).trim();
  s = path.basename(s);
  s = s.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/\.{2,}/g, '.');
  if (s.length > maxLength) s = s.slice(0, maxLength);
  if (!s) throw new Error('Invalid segment after sanitization');
  return s;
}

/**
 * Filename safe for S3 (keeps extension).
 */
function sanitizeFilename(originalname, { maxLength = 200 } = {}) {
  const base = path.basename(originalname || 'file');
  const ext = path.extname(base);
  let name = path.basename(base, ext);
  name = name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/\.{2,}/g, '.');
  if (!name) name = 'file';
  let out = `${name}${ext}`.slice(0, maxLength);
  if (!out) out = 'file';
  return out;
}

module.exports = { sanitizeSegment, sanitizeFilename };
