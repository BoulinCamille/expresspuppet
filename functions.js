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

async function scanOneUrl(page, priceSelector, nameSelector) {
    dataObj = {};
    dataObj['price'] = await getPrice(page, priceSelector);
    dataObj['name'] = await getName(page, nameSelector);
    return dataObj;
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


module.exports = { deleteCurrencyPrice, getAllHrefs, getPrice, getName, scanOneUrl }