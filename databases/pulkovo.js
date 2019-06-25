import sanitizeHtml from 'sanitize-html';
import minify from 'html-minifier';

export default (page, cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  await page.goto('https://pulkovo-cargo.ru/clients/dispatch', { waitUntil: 'domcontentloaded' });
  console.log('https://pulkovo-cargo.ru/clients/dispatch opened');
  await page.evaluate(() => {
    document.querySelector('#blankPrefix').value = cargoPrefix;
    document.querySelector('#blankNumber').value = cargoNumber;
  }, cargoPrefix, cargoNumber);
  const inputElement = await page.$('button#get-tracking');
  console.log(`submit button ${inputElement}`);
  await Promise.all([
    page.waitForResponse('https://pulkovo-cargo.ru/site/tracking'),
    inputElement.click(),
  ]);
  console.log('get response from https://pulkovo-cargo.ru/site/tracking');
  if (await page.$('.tracking-table') !== null) {
    const html = await page.evaluate(() => document.querySelector('#response').innerHTML);
    resolve({
      success: minify(sanitizeHtml(html, { allowedAttributes: { '*': ['colspan'] } }), {
        collapseWhitespace: true,
      }),
    });
  }
  reject(new Error('По данному номеру ничего не найдено'));
});
