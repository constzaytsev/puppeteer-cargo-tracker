import { Promise } from 'bluebird';
import sanitizeHtml from 'sanitize-html';
import { minify } from 'html-minifier';

export default (page, cargoPrefix, cargoNumber) => new Promise(async (resolve, reject) => {
  await page.goto(`https://www.shercargo.ru/rc_pub/plsql/www_pub.awb_info?p_awb_pr=${cargoPrefix}&p_awb_no=${cargoNumber}`, { waitUntil: 'domcontentloaded' }).catch((err) => { console.log(err); });

  console.log(`https://www.shercargo.ru/rc_pub/plsql/www_pub.awb_info?p_awb_pr=${cargoPrefix}&p_awb_no=${cargoNumber}`);

  const fs = new Promise(async (res) => {
    if (await page.$('.ibox') !== null) {
      const html = minify(sanitizeHtml(await page.evaluate(() => document.querySelector('.ibox').innerHTML), { allowedAttributes: { '*': ['colspan'] } }), {
        collapseWhitespace: true,
      });
      res({
        success: html,
      });
    }
  });

  fs.timeout(3000).then((re) => {
    console.log('yes');
    resolve(re);
  }).catch(Promise.TimeoutError, () => {
    console.log('no');
    reject();
  });
});
