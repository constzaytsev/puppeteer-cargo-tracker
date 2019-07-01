import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://pulkovo-cargo.ru/ru-ru/clients/dispatch', {
      timeout: 10000,
    });
    await page.evaluate((prefix, number) => {
      document.querySelector('#blankPrefix').value = prefix;
      document.querySelector('#blankNumber').value = number;
    }, cargoPrefix, cargoNumber);
    const inputElement = await page.$('button#get-tracking');
    await Promise.all([
      page.waitForResponse('https://pulkovo-cargo.ru/site/tracking'),
      inputElement.click(),
    ]);

    if (await page.$('.tracking-table') === null) {
      return reject(new NoResultsError('No results'));
    }

    const html = minify(sanitizeHtml(await page.evaluate(() => document.querySelector('#response').innerHTML), { allowedAttributes: { '*': ['colspan'] } }), {
      collapseWhitespace: true,
    });

    return resolve(html);
  } catch (e) {
    return reject(e);
  } finally {
    browser.close();
  }
});
