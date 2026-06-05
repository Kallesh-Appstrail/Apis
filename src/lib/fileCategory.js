/**
 * Maps MIME type / extension to a top-level folder under each project.
 */
function getFileCategory(mimetype, originalname = '') {
  const mt = (mimetype || '').toLowerCase();
  const ext = (originalname.split('.').pop() || '').toLowerCase();

  if (mt.startsWith('image/')) return 'images';
  if (mt.startsWith('video/')) return 'videos';
  if (mt.startsWith('audio/')) return 'audio';

  if (mt === 'application/pdf' || ext === 'pdf') return 'documents';
  if (
    mt.includes('word') ||
    mt.includes('document') ||
    mt.includes('sheet') ||
    mt.includes('presentation') ||
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'txt', 'csv', 'rtf'].includes(
      ext
    )
  ) {
    return 'documents';
  }

  if (mt.startsWith('text/')) return 'documents';

  if (
    mt.includes('zip') ||
    mt.includes('rar') ||
    mt.includes('7z') ||
    mt.includes('tar') ||
    mt.includes('gzip') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'tgz'].includes(ext)
  ) {
    return 'archives';
  }

  return 'other';
}

module.exports = { getFileCategory };
