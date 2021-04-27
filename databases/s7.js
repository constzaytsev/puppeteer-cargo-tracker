import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default async (cargoPrefix, cargoNumber) => {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto(`https://cargo.s7.ru/shipment/track-n-trace/index.dot?language_id=3&prefix=${cargoPrefix}&number=${cargoNumber}`, {
      timeout: 5000,
    });

    await page.waitForSelector('#booking-result', {
      timeout: 5000,
    });

    if (await page.$('#booking-result table') === null) {
      throw new NoResultsError('No results');
    }

    const html = minify(sanitizeHtml(await page.evaluate(() => document.querySelector('#booking-result').innerHTML), { allowedAttributes: { '*': ['colspan'] } }), {
      collapseWhitespace: true,
    });

    return html;
  } finally {
    await browser.close();
  }
};
