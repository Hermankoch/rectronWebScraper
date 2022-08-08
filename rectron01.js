const puppeteer = require('puppeteer');

async function getLinks(){
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.rectronzone.co.za/latest');
  await page.waitForSelector('li.browse-cat a');


  const categories = await page.evaluate(() => {
    const catLinkArr = [];
    const links = document.querySelectorAll('li.browse-cat a');
    links.forEach((item) => {
      catLinkArr.push(item.href);
    });
    return catLinkArr;
    });
  await browser.close();
  return categories;
}

async function getPageData(link, page){
  try {
    await page.goto(link);
  }catch(err){
    console.log('Error:' + err);
  }
  while(await page.$('div.product-categories > div.row > div.col-md-12.text-center > a.btn-load-more')!== null){
    await page.waitForTimeout(1000);
    try {
      if(await page.waitForSelector('div.product-categories > div.row > div.col-md-12.text-center > a.btn-load-more', {timeout: 1000}) !== null){
        await page.click('div.product-categories > div.row > div.col-md-12.text-center > a.btn-load-more');
      }
    }catch(err){

    }
  }
  await page.waitForSelector('.footer', {timeout: 0});
  const itemsArr = await page.evaluate(() => {
    const mainCat = document.querySelectorAll('ul.sidebar-ul li.filtered-categories')[0].innerText.trim();
    const prodLinkArr = [];
    const links = document.querySelectorAll('.product-box-contain.product-wrap > a');
    links.forEach((item) => {
      prodLinkArr.push([item.href, mainCat]);
    });
    return prodLinkArr;
  });

  return itemsArr;
}

async function retry(promiseFactory, retryCount) {
  try {
    return await promiseFactory();
  } catch (error) {
    if (retryCount <= 0) {
      throw error;
    }
    return await retry(promiseFactory, retryCount - 1);
  }
}

async function getProductInfo(link, page){
  await page.setRequestInterception(false);
  await retry(()=> Promise.all([
    page.goto(link[0]),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' })
  ]), 10);

  try {
    await retry(
      () => page.waitForSelector('#product-details-values'), 8
    );
    const categories = await page.evaluate(() => {
      const proData = document.getElementById('product-details-values');
      const subCategory = document.querySelectorAll('ol.breadcrumb li a')[1].innerText;
      const sku = proData['dataset'].sku;
      const brand = proData['dataset'].brand;
      const arr = [subCategory,sku,brand];
      return arr;
    });

    return {
      mainCategory: link[1],
      subCategory: categories[0],
      sku: categories[1],
      brand: categories[2]
    }
  }
  catch(err){
    console.log(err);
    return {
      mainCategory: link[1],
      subCategory: 'none',
      sku: 'none',
      brand: 'none'
    }
  }
}

async function main() {
  const catLinkArr = await getLinks();

  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  const productLinkArr = [];
  let x = 1;
  for (let link of catLinkArr) {
    const data = await getPageData(link, page);
    productLinkArr.push(data);
    x++;
  }

  const productData = [];
  x = 1;
  let y = 1;
  for (let catArr of productLinkArr) {
    for(let link of catArr){
      const data = await getProductInfo(link, page);
      productData.push(data);
      if(y == 100){
        console.log('waiting 20s');
        await page.waitForTimeout(30000);
        y = 0;
      }
      if(x == 500 || x == 1000 || x == 1500 || x == 2000 || x == 2500 || x == 3000 || x == 3500 || x == 4000 || x == 4500){
        console.log('waiting 2m');
        await page.waitForTimeout(120000);
      }
      y++;
      console.log('Product Number: ' + x + 'LinK: '+ link[0]);
      x++;
    }
  }

  await browser.close();

  const fastcsv = require('fast-csv');
  const fs = require('fs');
  const ws = fs.createWriteStream("out.csv");
  fastcsv.write(productData, { headers: false }).pipe(ws);
}
main();
