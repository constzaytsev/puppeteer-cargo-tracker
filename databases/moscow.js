import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default async (cargoPrefix, cargoNumber) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://www.moscow-cargo.com/', {
      timeout: 5000,
    });

    try {
      await page.evaluate((prefix, number) => {
        document.querySelector('[name="status_search"]').value = prefix;
        document.querySelector('[name="status_search-2"]').value = number;
      }, cargoPrefix, cargoNumber);
      const inputElement = await page.$('input#getstatus');
      await inputElement.click();
      await page.waitForResponse('https://www.moscow-cargo.com/intapi/statusawb_v3');
    } catch (e) {
      throw new Error('Something wrong Moscow');
    }

    if (await page.$('.cpwi-table tbody#status tr') === null) {
      throw new NoResultsError('No results');
    }

    const data = await page.evaluate(() => document.querySelector('.cpwi-table').outerHTML);
    const html = minify(sanitizeHtml(data, { allowedAttributes: { '*': ['colspan'] } }), {
      collapseWhitespace: true,
    });

    return html;
  } finally {
    await browser.close();
  }
};
