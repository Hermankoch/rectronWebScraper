const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.rectronzone.co.za/latest');

  await page.setViewport({
  width: 1920,
  height:  1080,
  deviceScaleFactor: 1,
  });

  //const link = await page.
  await page.waitForSelector('.browse-cat');

  const categories = await page.evaluate(() => {
    const linkArr = [];
    const links = document.querySelectorAll(".browse-cat a");
    links.forEach((item) => {
      linkArr.push(item.href);
      page.waitForNavigation({waitUntil: 'load'});
      page.click(item);

    });
    return linkArr
  });
  console.log(categories);

  await browser.close();
})();
