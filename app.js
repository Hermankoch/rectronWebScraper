const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.rectronzone.co.za/latest');

  await page.setViewport({
  width: 1920,
  height:  1080,
  deviceScaleFactor: 1,
  });

  await page.waitForSelector('.browse-cat a');
  const links = document.querySelectorAll(".browse-cat a");

  await browser.close();

})();
