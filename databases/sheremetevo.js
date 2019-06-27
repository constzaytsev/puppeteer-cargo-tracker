import puppeteer from 'puppeteer';
import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(`https://www.shercargo.ru/rc_pub/plsql/www_pub.awb_info?p_awb_pr=${cargoPrefix}&p_awb_no=${cargoNumber}`, { waitUntil: 'domcontentloaded' });

  if (await page.$('.ibox') !== null) {
    const data = await page.evaluate(() => {
      let innerHTML = '';
      Array.from(document.querySelectorAll('.ibox')).forEach((el) => {
        innerHTML += el.innerHTML;
      });
      return innerHTML;
    });

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
