import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';
import { Promise } from 'bluebird';
import * as Sentry from '@sentry/node';

import Aeroflot from './databases/aeroflot';
import Pulkovo from './databases/pulkovo';

require('dotenv').config();

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

  console.log(`connecting to ${process.env.PUPPETEER_HOST}`);

  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.PUPPETEER_HOST,
  }).catch((err) => { throw err; });

  console.log('browser created');

  const page = await browser.newPage();

  console.log('new page opened');

  // const result = cargoPrefix == 555
  //   ? await Aeroflot(page, cargoPrefix, cargoNumber)
  //   : await Pulkovo(page, cargoPrefix, cargoNumber).catch((error) => { console.log(error); });

  const result = await Promise.any([
    Aeroflot(page, cargoPrefix, cargoNumber),
    Pulkovo(page, cargoPrefix, cargoNumber),
  ]).catch(() => {});

  // const result = await Pulkovo(page, cargoPrefix, cargoNumber).catch((error) => { console.log(error); });

  res.json({
    result,
  });

  browser.close();
});

app.use(Sentry.Handlers.errorHandler());

app.listen(8000, () => {
  /* eslint no-console: 0 */
  console.log('App listening on port 8000!');
});
