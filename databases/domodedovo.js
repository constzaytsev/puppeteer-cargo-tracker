import puppeteer from 'puppeteer';
import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://business.dme.ru/cargo/e-cargo/info/', { waitUntil: 'domcontentloaded' });

  await page.evaluate((prefix, number) => {
    document.querySelector('[name="NumberFirstPart"]').value = prefix;
    document.querySelector('[name="NumberSecondPart"]').value = number;
  }, cargoPrefix, cargoNumber);

  const inputElement = await page.$('input.w80');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    inputElement.click(),
  ]);

  if (await page.$$eval('.table_style_cargo tr', divs => divs.length) > 1) {
    const data = await page.evaluate(() => document.querySelector('.table_style_cargo').outerHTML);

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
