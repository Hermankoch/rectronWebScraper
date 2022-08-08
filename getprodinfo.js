const puppeteer = require('puppeteer');

async function getLinks(){
  const browser = await puppeteer.launch({headless: false});
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
  return categories;
}

async function getPageData(url, page){
  await page.goto(url);
  await page.setViewport({
  width: 1920,
  height:  1080,
  deviceScaleFactor: 1,
  });
  const h1 = await page.$eval('.product_main h1', h1 => h1.innerText);
  const price = await page.$eval('.price_color', price => price.innerText);
  const instock = await page.$eval('.instock.availability', instock => instock.innerText);

  return {
    title: h1,
    price: price,
    instock: instock
  }
}

async function main() {
  const linkArr = await getLinks();

  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  const scrapedData = [];
  for (let link of linkArr) {
    const data = await getPageData(link, page);
    scrapedData.push(data);
  }
  console.log(scrapedData);
  await browser.close();
}
main();
