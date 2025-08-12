const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

const TARGET_HOST = 'firebase-access-bridge-production.up.railway.app';
const TARGET_PATH = '/access-event';

app.post('/proxy-access-event', (req, res) => {
  const payload = JSON.stringify(req.body);

  const options = {
    hostname: TARGET_HOST,
    path: TARGET_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => (data += chunk));
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode).send(data);
    });
  });

  proxyReq.on('error', (err) => {
    res.status(500).send({ error: 'Proxy request failed', details: err.message });
  });

  proxyReq.write(payload);
  proxyReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Proxy server running on port ${PORT}`));