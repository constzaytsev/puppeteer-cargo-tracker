require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const Aeroflot = require('./databases/aeroflot.js');
const Pulkovo = require('./databases/pulkovo.js');

const app = express();

app.get('/track', async (req, res) => {

  const cargoPrefix  = req.query.prefix;
  const cargoNumber  = req.query.number;

  if(!cargoPrefix) return res.json({error: 'Не указан префикс груза'});
  if(!cargoNumber) return res.json({error: 'Не указан номер груза'});

  const browser = await puppeteer.connect({
    browserWSEndpoint: process.env.PUPPETEER_HOST
  });

  const page = await browser.newPage();
  const result = await Pulkovo(page, cargoPrefix, cargoNumber);
  res.json(result);
  browser.close();
});

app.listen(8000, function () {
  console.log('App listening on port 8000!');
});
