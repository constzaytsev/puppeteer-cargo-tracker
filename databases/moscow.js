import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.moscow-cargo.com/', {
      // waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    await page.evaluate((prefix, number) => {
      document.querySelector('[name="status_search"]').value = prefix;
      document.querySelector('[name="status_search-2"]').value = number;
    }, cargoPrefix, cargoNumber);
    const inputElement = await page.$('input#getstatus');
    await Promise.all([
      page.waitForResponse('https://www.moscow-cargo.com/api/statusawb_v3'),
      inputElement.click(),
    ]);

    if (await page.$('.cpwi-table tbody#status tr') === null) {
      return reject(new NoResultsError('No results'));
    }

    const data = await page.evaluate(() => document.querySelector('.cpwi-table').outerHTML);
    const html = minify(sanitizeHtml(data, { allowedAttributes: { '*': ['colspan'] } }), {
      collapseWhitespace: true,
    });

    return resolve(html);
  } catch (e) {
    return reject(e);
  } finally {
    browser.close();
  }
});
