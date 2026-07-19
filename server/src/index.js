import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { submitEvaluation, isMockMode } from './alloy.js';
import { validateApplication } from './validate.js';

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, mockMode: isMockMode() });
});

app.post('/api/applications', async (req, res) => {
  const { errors, payload } = validateApplication(req.body ?? {});
  if (errors) {
    return res.status(400).json({ errors });
  }

  try {
    const result = await submitEvaluation(payload);
    // Never log the payload itself; it contains an SSN and other PII.
    console.log(
      `Evaluation complete: outcome="${result.outcome}"` +
        (result.evaluationToken ? ` token=${result.evaluationToken}` : '') +
        (result.mock ? ' [mock]' : '')
    );
    res.json(result);
  } catch (err) {
    console.error(`Alloy request failed (${err.status ?? 'network'}): ${err.message}`);
    const status = err.status && err.status < 500 ? 422 : 502;
    res.status(status).json({
      error:
        err.message ||
        'We could not process your application right now. Please try again shortly.',
    });
  }
});

// In production the Express server also serves the built React app, so the
// whole thing deploys as a single web service (one URL, no CORS).
if (process.env.NODE_ENV === 'production') {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const clientDist = path.resolve(dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Otter Bank API listening on http://localhost:${port}`);
  if (isMockMode()) {
    console.warn(
      'No Alloy credentials found, running in MOCK mode. ' +
        'Copy server/.env.example to server/.env and add real credentials for live evaluations.'
    );
  }
});
