import fetch from 'node-fetch';

import puppeteer from 'puppeteer';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cookiePath = path.join(__dirname, 'cookies.json');

const SKU = '6559272';
const ZIP = '80487';
const LINK = 'https://www.bestbuy.com/site/xfx-speedster-swft319-amd-radeon-rx-6800-16gb-gddr6-pci-express-4-0-gaming-graphics-card-black/6559272.p?skuId=6559272';

const url = 'https://www.bestbuy.com/fulfillment/shipping/api/v1/fulfillment/sku;skuId=' + SKU + ';postalCode=' + ZIP + ';deliveryDateOption=EARLIEST_AVAILABLE_DATE;selectedDeliveryServiceSkuIds=?paidMembership=false&planPaidMemberType=NULL';

const headers = {
  'Host': 'www.bestbuy.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:134.0) Gecko/20100101 Firefox/134.0',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Referer': LINK,
  'X-REQUEST-ID': 'BROWSE',
  'X-CLIENT-ID': 'FRV',
  'Content-Type': 'application/json',
  'mode': 'cors',
  'Origin': 'https://www.bestbuy.com',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Priority': 'u=4',
  'TE': 'trailers'
};

  while(true) {
try {
    const response = await fetch(url, {
        method: 'GET',
        headers
    });
    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    const RInfo = data.responseInfos[0]
    if(RInfo.pickupEligible || RInfo.deliveryEligible || RInfo.shippingEligible || RInfo.shippingInfo.shippable || RInfo.fulfillByVendor) {

        process.stdout.write('\x1B[3J\x1B[2J\x1B[H');
        console.log('--------------------------- AVAILABLE ---------------------------\n', JSON.stringify(data, null, 2));
        for(let i = 0; i < 5; i++) {
             console.log('--------------------------- AVAILABLE ---------------------------');
        }
        break;
    }
    console.log(JSON.stringify(data, null, 2));
    await new Promise(resolve => setTimeout(resolve, 500));
} catch(err) {
    console.error(`Error `, err);
}
  }


  (async () => {
    const browser = await puppeteer.launch({headless: false,    
                                          args: ['--start-maximized'],
                                          defaultViewport: null,});
    const page = await browser.newPage();
    const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf-8'));

    await browser.setCookie(...cookies);
    await page.goto(LINK);
    
    let elementFound = false;

    while (!elementFound) {
      const element = await page.$('[data-button-state="ADD_TO_CART"][data-sku-id="' + SKU + '"]');
  
      if (element) {
        elementFound = true; 
      } else {
        console.log("Product not available - Reloading...")
        await page.reload({ ignoreCache: true });
      }
      
    }

    const buttons = await page.$$('[class="c-tile border rounded v-base"]');
    let exit = false;
    for(const button of buttons) {
        if(exit){break;}
        const strongElements = await button.$$('strong');
        for (const strong of strongElements) {
          const strongText = await page.evaluate(el => el.textContent.trim(), strong);
          if(strongText == 'Shipping') {
            button.click();
            exit = true;
            break;
          }
        }
    }

    await page.locator('[data-button-state="ADD_TO_CART"][data-sku-id="' + SKU + '"]').click();
})();
