import puppeteer from 'puppeteer';
import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://pulkovo-cargo.ru/ru-ru/clients/dispatch', { waitUntil: 'load' });
  await page.evaluate((prefix, number) => {
    document.querySelector('#blankPrefix').value = prefix;
    document.querySelector('#blankNumber').value = number;
  }, cargoPrefix, cargoNumber);
  const inputElement = await page.$('button#get-tracking');
  await Promise.all([
    page.waitForResponse('https://pulkovo-cargo.ru/site/tracking'),
    inputElement.click(),
  ]);

  if (await page.$('.tracking-table') !== null) {
    const html = minify(sanitizeHtml(await page.evaluate(() => document.querySelector('#response').innerHTML), { allowedAttributes: { '*': ['colspan'] } }), {
      collapseWhitespace: true,
    });
    resolve({
      success: html,
    });
  } else {
    reject();
  }

  browser.close();
});
