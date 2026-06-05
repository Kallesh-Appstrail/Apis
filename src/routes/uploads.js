const express = require('express');
const multer = require('multer');
const { uploadBuffer, getPresignedGetUrl } = require('../services/s3Service');

const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 524288000);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxBytes, files: 20 },
});

const router = express.Router();

/**
 * POST /api/projects/:projectId/upload
 * multipart field name: "file" (single) or "files" (multiple)
 */
router.post('/:projectId/upload', upload.any(), async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    const files = req.files || [];
    const fromSingle = req.file ? [req.file] : [];
    const list = files.length ? files : fromSingle;

    if (!list.length) {
      return res.status(400).json({
        error: 'No file uploaded',
        hint: 'Use multipart/form-data with field "file" or "files"',
      });
    }

    const results = [];
    for (const f of list) {
      const r = await uploadBuffer({
        projectId,
        buffer: f.buffer,
        mimetype: f.mimetype,
        originalname: f.originalname,
      });
      results.push(r);
    }

    return res.status(201).json({
      projectId,
      count: results.length,
      files: results,
    });
  } catch (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large', maxBytes });
    }
    const status = err.statusCode || 500;
    return res.status(status).json({
      error: err.message || 'Upload failed',
    });
  }
});

/**
 * GET /api/projects/:projectId/files/url?key=projects/...
 * Returns a fresh access URL (presigned unless S3_PUBLIC_BASE_URL is set).
 */
router.get('/:projectId/files/url', async (req, res) => {
  try {
    const { projectId } = req.params;
    const key = req.query.key;
    if (!key || typeof key !== 'string') {
      return res.status(400).json({ error: 'query param "key" is required' });
    }
    const url = await getPresignedGetUrl(projectId, decodeURIComponent(key));
    return res.json({ projectId, key, url });
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || 'Failed to sign URL' });
  }
});

module.exports = router;
