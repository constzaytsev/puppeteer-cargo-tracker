import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default async (cargoPrefix, cargoNumber) => {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto('https://pulkovo-cargo.ru/ru-ru/clients/dispatch', {
      timeout: 5000,
    });

    try {
      await page.evaluate((prefix, number) => {
        document.querySelector('#blankPrefix').value = prefix;
        document.querySelector('#blankNumber').value = number;
      }, cargoPrefix, cargoNumber);
      const inputElement = await page.$('button#get-tracking');
      await inputElement.click();
      await page.waitForResponse('https://pulkovo-cargo.ru/site/tracking');
    } catch (e) {
      throw new Error('Something wrong Pulkovo');
    }

    if (await page.$('.tracking-table') === null) {
      throw new NoResultsError('No results');
    }

    const html = minify(sanitizeHtml(await page.evaluate(() => document.querySelector('#response').innerHTML), { allowedAttributes: { '*': ['colspan'] } }), {
      collapseWhitespace: true,
    });

    return html;
  } finally {
    await browser.close();
  }
};
