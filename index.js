import express from 'express';
import cors from 'cors';
import { Promise } from 'bluebird';
import * as Sentry from '@sentry/node';
import cache from './plugins/cache';

import Sheremetevo from './databases/sheremetevo';
import Pulkovo from './databases/pulkovo';
import Domodedovo from './databases/domodedovo';
import Moscow from './databases/moscow';

const PORT = process.env.PORT || 5000;

const app = express();

Sentry.init({
  dsn: 'https://4ea34bda20f4461386d47ea142c87a36@o183199.ingest.sentry.io/1371072',
  environment: 'dev',
});

app.use(Sentry.Handlers.requestHandler());
app.use(cors());

app.get('/track', cache(600), async (req, res) => {
  const cargoPrefix = req.query.prefix;
  const cargoNumber = req.query.number;

  if (!cargoPrefix) return res.json({ result: { error: 'Не указан префикс груза' } });
  if (!cargoNumber) return res.json({ result: { error: 'Не указан номер груза' } });

  try {
    const result = await Promise.any([
      Pulkovo(cargoPrefix, cargoNumber),
      Sheremetevo(cargoPrefix, cargoNumber),
      Domodedovo(cargoPrefix, cargoNumber),
      Moscow(cargoPrefix, cargoNumber),
    ]);
    return res.json({
      result: {
        success: result,
      },
    });
  } catch (e) {
    e.forEach((error) => {
      if (error.name !== 'NoResults') Sentry.captureException(error);
    });

    return res.json({
      result: {
        error: 'Не найдено',
      },
    });
  }
});

app.use((req, res) => {
  res.status(404).end(); // not found
});

app.listen(PORT, () => {
  /* eslint no-console: 0 */
  console.log(`Listening on ${PORT}`);
});
