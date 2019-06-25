import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (page, cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  await page.goto('https://pulkovo-cargo.ru/clients/dispatch', { waitUntil: 'domcontentloaded' });
  await page.evaluate((prefix, number) => {
    document.querySelector('#blankPrefix').value = prefix;
    document.querySelector('#blankNumber').value = number;
  }, cargoPrefix, cargoNumber);
  const inputElement = await page.$('button#get-tracking');
  await Promise.all([
    page.waitForResponse('https://pulkovo-cargo.ru/site/tracking'),
    inputElement.click(),
  ]);

  const fs = new Promise(async (res) => {
    if (await page.$('.tracking-table') !== null) {
      const html = minify(sanitizeHtml(await page.evaluate(() => document.querySelector('#response').innerHTML), { allowedAttributes: { '*': ['colspan'] } }), {
        collapseWhitespace: true,
      });
      res({
        success: html,
      });
    }
  });

  fs.timeout(3000).then((re) => {
    resolve(re);
  }).catch(Promise.TimeoutError, () => {
    reject();
  });
});
