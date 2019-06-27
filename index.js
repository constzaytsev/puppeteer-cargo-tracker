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
app.use(cors());

app.get('/track', async (req, res) => {
  console.log('/track handeled');

  const cargoPrefix = req.query.prefix;
  const cargoNumber = req.query.number;

  if (!cargoPrefix) return res.json({ result: { error: 'Не указан префикс груза' } });
  if (!cargoNumber) return res.json({ result: { error: 'Не указан номер груза' } });

  console.log('browser created');

  const result = await Promise.any([
    // Sheremetevo(cargoPrefix, cargoNumber),
    // Pulkovo(cargoPrefix, cargoNumber),
    Domodedovo(cargoPrefix, cargoNumber),
    // Moscow(cargoPrefix, cargoNumber),
  ]).catch((e) => {
    throw (e);
  });

  res.json({
    result,
  });
});

app.use(Sentry.Handlers.errorHandler());

app.listen(8000, () => {
  /* eslint no-console: 0 */
  console.log('App listening on port 8000!');
});
