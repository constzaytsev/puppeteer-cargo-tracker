import express from 'express';
import cors from 'cors';
import { Promise } from 'bluebird';
import * as Sentry from '@sentry/node';

import Sheremetevo from './databases/sheremetevo';
import Pulkovo from './databases/pulkovo';
import Domodedovo from './databases/domodedovo';
import Moscow from './databases/moscow';

Sentry.init({ dsn: 'https://4ea34bda20f4461386d47ea142c87a36@sentry.io/1371072' });

const app = express();
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
app.use(cors());

app.get('/track', async (req, res) => {
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
      success: result,
    });
  } catch (e) {
    e.forEach((error) => {
      if (error.name !== 'NoResults') Sentry.captureException(error);
    });

    return res.json({
      success: null,
    });
  }
});

app.listen(8080, () => {
  /* eslint no-console: 0 */
  console.log('App listening on port 8080!');
});
