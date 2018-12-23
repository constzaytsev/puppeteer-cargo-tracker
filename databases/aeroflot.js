module.exports = async (page, cargoPrefix, cargoNumber) => {
  await page.goto('https://www.aeroflot.ru/personal/cargo_tracking?preferredLanguage=ru',{ waitUntil: 'domcontentloaded' });
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
    return {
      'result': await page.evaluate(() => JSON.stringify(document.querySelector('.list').outerHTML))
    }
  }
  else return {
    'error': 'По данному номеру ничего не найдено'
  }

}
