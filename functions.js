const pup = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const randomUserAgent = require("random-useragent");
const constants = require('./constants');
pup.use(StealthPlugin);


async function getAllHrefs(page) {
    try {
        let hrefs = await page.$$eval('a', (anchorEls) => anchorEls.map((a) => a.href));
        return hrefs;
    } catch (e) {
        console.log(e);
    }
}


async function getPrice(page, selector) {
    let price = null;
    try {
        price = await page.$eval(selector, p => p.value);
    } catch(e) {
        console.log(e);
    }
    try {
        price = await page.$eval(selector, p => p.textContent);
    } catch(e) {
        console.log(e);
    }
    try {
        price = deleteCurrencyPrice(price).trim();
    } catch (e) {
        console.log(e);
    }
    
    
    return price;
}


async function getName(page, selector) {
    let name = null
    try {
        name = await page.$eval(selector, n => n.textContent);
    } catch(e) {
        console.log(e);
    }
    
    return name;
}

async function scanOneUrl(url, priceSelector, nameSelector) {
    const browser = await createBrowser();
    const page = await browser.newPage();
    await page.goto(url);
    const blockedResources = constants.blockedResources();
    console.log(blockedResources);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.url().endsWith('.png') || request.url().endsWith('.jpg'))
            request.abort();
        else if (blockedResources.some(resource => blockedResources.indexOf(resource) !== -1))
            request.abort();
        else
            request.continue();
      });
    const cookies = await page.cookies();
    // await page.deleteCookie(...cookies);
    const datadomeCookieValue = cookies[0]['value'];

    const scripts = await page.$$eval("script", scripts => scripts.map(script => script.textContent));
    regex = /^var dd.+/
    let script = "";
    scripts.forEach(el => {
        if (el.match(regex)) {
            script = el;
        }
    });
    script = script.replace("var dd=", "");
    script = replaceAll(script, "'", '"');
    script = JSON.parse(script);
    const initialCid = script['cid'];
    const hsh = script['hsh'];
    const t = script['t'];
    const host = script['host'];
    const cid = datadomeCookieValue;
    console.log(script);
    // dataObj = {};
    // dataObj['price'] = await getPrice(page, priceSelector);
    // dataObj['name'] = await getName(page, nameSelector);
    return page.content();
}


function deleteCurrencyPrice(price) {
    try {
        if (price.search('€') !== -1) {
            price = price.replace('€', "");
        }
    } catch (e) {
        console.log(e);
    }
    
    return price;
}


async function createBrowser() {
    const browser = await pup.launch()
    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
    await browser.userAgent(UA);

    return browser;
}


function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}


module.exports = { createBrowser, deleteCurrencyPrice, getAllHrefs, getPrice, getName, scanOneUrl }