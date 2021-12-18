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

async function scanOneUrl(page, priceSelector, nameSelector) {
    dataObj = {};
    dataObj['price'] = await getPrice(page, priceSelector);
    dataObj['name'] = await getName(page, nameSelector);
    return dataObj;
}


module.exports = { getAllHrefs, getPrice, getName, scanOneUrl }