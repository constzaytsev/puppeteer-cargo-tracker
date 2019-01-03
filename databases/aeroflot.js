const sanitizeHtml = require('sanitize-html');
const minify = require('html-minifier').minify;

module.exports = async (page, cargoPrefix, cargoNumber) => {
  await page.goto('https://www.aeroflot.ru/personal/cargo_tracking?preferredLanguage=ru&_preferredLocale=ru&_preferredLanguage=ru',{ waitUntil: 'domcontentloaded' });
  await page.evaluate((cargoPrefix, cargoNumber) => {
    document.querySelector('#id_awb_0').value = cargoPrefix;
    document.querySelector('#id_awb_1').value = cargoNumber;
  }, cargoPrefix, cargoNumber);
  const inputElement = await page.$('input[name=submit_awb]');
  await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      inputElement.click(),
  ]);

  if (await page.$('.list') !== null) {
    const html = await page.evaluate(() => document.querySelector('.list').outerHTML);
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
