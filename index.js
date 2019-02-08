require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const ua = require('universal-analytics');

const visitor = ua('UA-134136473-1');

const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://4ea34bda20f4461386d47ea142c87a36@sentry.io/1371072' });

const Aeroflot = require('./databases/aeroflot.js');
const Pulkovo = require('./databases/pulkovo.js');

const app = express();
app.use(Sentry.Handlers.requestHandler());
app.use(cors());


app.get('/track', async (req, res) => {
  visitor.pageview('/track', '/track', 'Tracking page').send();

  const cargoPrefix = req.query.prefix;
  const cargoNumber = req.query.number;

  if (!cargoPrefix) return res.json({ result: { error: 'Не указан префикс груза' } });
  if (!cargoNumber) return res.json({ result: { error: 'Не указан номер груза' } });

  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.PUPPETEER_HOST,
  }).catch((err) => { throw err; });

  const page = await browser.newPage();
  const result = cargoPrefix === 555
    ? await Aeroflot(page, cargoPrefix, cargoNumber)
    : await Pulkovo(page, cargoPrefix, cargoNumber);
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
