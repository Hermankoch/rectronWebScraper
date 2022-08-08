const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://books.toscrape.com/');

  await page.setViewport({
  width: 1920,
  height:  1080,
  deviceScaleFactor: 1,
  });


  await page.waitForSelector('.product_pod .image_container a');

  //const categories = await page.$$eval('.product_pod .image_container a', allA => allA.map(a => a.href));

  const categories = await page.evaluate(() => {
    const linkArr = [];
    const links = document.querySelectorAll('.product_pod .image_container a');
    links.forEach((item) => {
      linkArr.push(item.href);
    });
    return linkArr;
    });

  console.log(categories);
  await browser.close();

})();
