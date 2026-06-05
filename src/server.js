require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uploadsRouter = require('./routes/uploads');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'scholersworld-storage-api' });
});

app.use('/api/projects', uploadsRouter);

app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large' });
  }
  return res.status(500).json({ error: err.message || 'Internal error' });
});

app.listen(port, () => {
  console.log(`Storage API listening on http://localhost:${port}`);
});
