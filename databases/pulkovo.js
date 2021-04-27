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
      console.log(e);
      throw new Error('Something wrong Pulkovo');
    }

    if (await page.$('.tracking-table') === null) {
      console.log(e);
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
