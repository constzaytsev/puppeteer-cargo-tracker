module.exports = async (page, cargoPrefix, cargoNumber) => {
  await page.goto('https://pulkovo-cargo.ru/clients/dispatch',{ waitUntil: 'domcontentloaded' });
  await page.type('#blankPrefix', cargoPrefix);
  await page.type('#blankNumber', cargoNumber);
  const inputElement = await page.$('button#get-tracking');
  await Promise.all([
      page.waitFor(() =>
        document.querySelectorAll('.tracking-table, .error-status').length
      ),
      inputElement.click(),
  ]);

  if (await page.$('.tracking-table') !== null) {
    return {
      'result': await page.evaluate(() => JSON.stringify(document.querySelector('#response').innerHTML))
    }
  }
  else return {
    'error': 'По данному номеру ничего не найдено'
  }

}
