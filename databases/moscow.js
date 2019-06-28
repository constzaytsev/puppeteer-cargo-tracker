import puppeteer from 'puppeteer';
import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.moscow-cargo.com/', {
      // waitUntil: 'domcontentloaded',
      timeout: 5000,
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

    // setTimeout(async () => {
    const t = await page.$('.cpwi-table tbody#status tr').catch(() => {});


    if (t !== null) {
      const data = await page.evaluate(() => document.querySelector('.cpwi-table').outerHTML);
      const html = minify(sanitizeHtml(data, { allowedAttributes: { '*': ['colspan'] } }), {
        collapseWhitespace: true,
      });
      browser.close();
      return resolve({ success: html });
    }
    browser.close();
    console.log('dsfsdfsdfsd2222f');
    return reject('sdfsdf');
    // }, 5000);
  } catch (e) {
    return reject(e);
  }
});
