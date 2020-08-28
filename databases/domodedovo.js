import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default async (cargoPrefix, cargoNumber) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      // '--proxy-server=socks5://127.0.0.1:9050',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://business.dme.ru/cargo/info/', {
      timeout: 5000,
    });

    try {
      await page.evaluate((prefix, number) => {
        document.querySelector('#awbpre').value = prefix;
        document.querySelector('#awbnum').value = number;
      }, cargoPrefix, cargoNumber);

      const inputElement = await page.$('input.w80');
      await inputElement.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } catch (e) {
      throw new Error('Something wrong Domodedovo');
    }

    if (await page.$$eval('.table_style_cargo tr', (divs) => divs.length) < 2) {
      throw new NoResultsError('No results');
    }

    const data = await page.evaluate(() => document.querySelector('.table_style_cargo').outerHTML);
    const html = minify(sanitizeHtml(data, { allowedAttributes: { '*': ['colspan'] } }), { collapseWhitespace: true });

    return html;
  } finally {
    await browser.close();
  }
};
