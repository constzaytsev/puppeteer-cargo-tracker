import puppeteer from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';
import NoResultsError from '../plugins/NoResultsError';

export default (cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto(`https://www.shercargo.ru/rc_pub/plsql/www_pub.awb_info?p_awb_pr=${cargoPrefix}&p_awb_no=${cargoNumber}`, {
      // waitUntil: 'domcontentloaded',
      timeout: 10000,
    });

    if (await page.$('.ibox') === null) {
      return reject(new NoResultsError('No results'));
    }

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

    return resolve(html);
  } catch (e) {
    return reject(e);
  } finally {
    browser.close();
  }
});
