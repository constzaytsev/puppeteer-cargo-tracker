import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

// const { exec } = require('child_process');

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  // exec('(echo authenticate \'""\'; echo signal newnym; echo quit) | nc localhost 9051');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      // '--proxy-server=socks5://127.0.0.1:9050',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://business.dme.ru/cargo/e-cargo/info/', {
      timeout: 10000,
    });
    await page.evaluate((prefix, number) => {
      document.querySelector('[name="NumberFirstPart"]').value = prefix;
      document.querySelector('[name="NumberSecondPart"]').value = number;
    }, cargoPrefix, cargoNumber);

    const inputElement = await page.$('input.w80');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      inputElement.click(),
    ]);

    if (await page.$$eval('.table_style_cargo tr', divs => divs.length) < 2) {
      return reject(new NoResultsError('No results'));
    }

    const data = await page.evaluate(() => document.querySelector('.table_style_cargo').outerHTML);
    const html = minify(sanitizeHtml(data, { allowedAttributes: { '*': ['colspan'] } }), { collapseWhitespace: true });

    return resolve(html);
  } catch (e) {
    return reject(e);
  } finally {
    browser.close();
  }
});
