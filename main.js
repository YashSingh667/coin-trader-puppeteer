const puppeteer = require('puppeteer');

async function performSwap(chainName, sell, sellToken, buyToken) {

  // creating a function to find our coin in the list and click on it.
  async function findAndClickElement(myElement, searchKeyword) {
    if (myElement.length > 0) {
      // variable to track if we found our target coin in the list or not.
      var coinIsThere = false;
      for (const element of myElement) {
        const isElementVisible = await page.evaluate(el => {
          return (
            el.offsetParent !== null && // Checks if element is there in DOM
            // checks if element is visible on page and is not collapsed
            el.offsetHeight > 0 &&
            el.offsetWidth > 0
          );
        }, element);
        if (isElementVisible) {
          const textContent = await page.evaluate(el => el.textContent, element);
          // checks if target coin in the HTML of our list and clicks on it while logging success.
          if (textContent.includes(searchKeyword)) {
            coinIsThere = true;
            await element.click();
            console.log("Coin found and Clicked!");
          }
        }
      }
      if (coinIsThere == false) {
        // logs the error and closes browser if the script cant find the target coin name in innerHTML
        console.log(`Coin ${searchKeyword} not found ! Please recheck inputs!`);
        await browser.close();
      }
    } else {
      // logs if the selector cant find the elements with the class name specified in the selector
      console.log('Element not found. Check the Selector !');
    }
  }


  // launching the browser
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // sets the viewport size
  const viewportWidth = 1280;
  const viewportHeight = 720;
  await page.setViewport({ width: viewportWidth, height: viewportHeight });
  // goes to target site
  await page.goto('https://swap.defillama.com');

  // Filling the form
  // assumes that the chainName that we entered is present in the list
  await page.type('#react-select-2-input', chainName);
  await page.click('#react-select-2-listbox');

  // select the sell input box. clearing it and entering our specified value
  await page.focus('input[class="chakra-input css-lv0ed5"]'); 
  await page.keyboard.down('Control');
  await page.keyboard.press('A'); 
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace'); 
  await page.type('input[class="chakra-input css-lv0ed5"]', sell); 

  // selecting the coin selector elements 
  const elements = await page.$$('button[class = "chakra-button css-qjhap"]');
  // clicking on sell coin element
  await elements[0].click();
  // types our specified coin name
  await page.type('input[class = "chakra-input css-s1d1f4"]', sellToken);
  // waiting for result list to load
  await page.waitForTimeout(1000);


  // selecting all elements in the resulting list
  const mySellElement = await page.$$('.sc-b49748d5-3.cjxQGj');
  await findAndClickElement(mySellElement, "(" + sellToken + ")");

  await page.waitForTimeout(1000);

  // clicking on buy coin element
  await elements[1].click();
  // types our specified coin name
  await page.type('input[class = "chakra-input css-s1d1f4"]', buyToken);
  //waiting for result list to load
  await page.waitForTimeout(1000);

  // selecting all elements in the resulting list
  const myBuyElement = await page.$$('.sc-b49748d5-3.cjxQGj');
  await findAndClickElement(myBuyElement, "(" + buyToken + ")");


  // waiting for 15 seconds to wait for right side element to load
  await page.waitForTimeout(15000);

  // selecting all elements in the list
  const myRoutes = await page.$$('.RouteWrapper');

  // checks if there are non zero and more than one elements in the list
  if (myRoutes.length > 0) {
    if (myRoutes.length == 1) {
      console.log("Only 1 route Found");
      await myRoutes[0].click();
    }
    else {
      await myRoutes[1].click();
    }
  }
  else {
    console.log("Element not found");
  }



  await new Promise(() => { });
}


// specify the data here
const runData = {
  chain: 'Arbitrum',
  sell: '12',
  sellToken: 'WBTC',
  buyToken: 'USDC'
}


performSwap(runData["chain"], runData["sell"], runData["sellToken"], runData["buyToken"]);
