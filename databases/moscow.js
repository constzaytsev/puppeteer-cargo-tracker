import puppeteer from 'puppeteer';
import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.moscow-cargo.com/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((prefix, number) => {
    document.querySelector('[name="status_search"]').value = prefix;
    document.querySelector('[name="status_search-2"]').value = number;
  }, cargoPrefix, cargoNumber);
  const inputElement = await page.$('input#getstatus');
  await Promise.all([
    page.waitForResponse('https://www.moscow-cargo.com/api/statusawb_v3'),
    inputElement.click(),
  ]);

  if (await page.$('.cpwi-table') !== null) {
    const data = await page.evaluate(() => document.querySelector('.cpwi-table').outerHTML);

    const html = minify(sanitizeHtml(data, { allowedAttributes: { '*': ['colspan'] } }), {
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
