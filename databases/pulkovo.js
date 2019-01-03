const sanitizeHtml = require('sanitize-html');
const minify = require('html-minifier').minify;

module.exports = async (page, cargoPrefix, cargoNumber) => {
  await page.goto('https://pulkovo-cargo.ru/clients/dispatch',{ waitUntil: 'domcontentloaded' });
  await page.evaluate((cargoPrefix, cargoNumber) => {
    document.querySelector('#blankPrefix').value = cargoPrefix;
    document.querySelector('#blankNumber').value = cargoNumber;
  }, cargoPrefix, cargoNumber);
  const inputElement = await page.$('button#get-tracking');
  await Promise.all([
      page.waitForResponse('https://pulkovo-cargo.ru/site/tracking'),
      inputElement.click(),
  ]);

  if (await page.$('.tracking-table') !== null) {
    const html = await page.evaluate(() => document.querySelector('#response').innerHTML);
    return {
      'success': minify(sanitizeHtml(html, {allowedAttributes: {'*': ['colspan']}}), {
        collapseWhitespace: true
      })
    }
  }
  else return {
    'error': 'По данному номеру ничего не найдено'
  }

}
