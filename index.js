const Koa = require('koa');
const Router = require('koa-router');
const puppeteer = require('puppeteer');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: 'wss://chrome.browserless.io/'
  });

  const page = await browser.newPage();

  await page.goto('https://www.aeroflot.ru/personal/cargo_tracking?preferredLanguage=ru',{waitUntil: 'domcontentloaded'}).then(() => {
    console.log('load');
  }).catch((error) => {
    console.log(error);
  });

  await page.type('#id_awb_1', '3423234', {delay: 100});
  const inputElement = await page.$('input[name=submit_awb]');

  await Promise.all([
      inputElement.click(),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
  ]);

  const result = await page.evaluate(() => document.querySelector('.message[role=alert]').innerText);
  // console.log(result);

  ctx.body = result;

  browser.close();
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000);
