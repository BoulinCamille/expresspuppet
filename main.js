const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const functions = require('./functions')
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const randomUserAgent = require("random-useragent");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin);

const app = express();

app.use(bodyParser.urlencoded({
    extended: true
})); 

app.use(bodyParser.json() );

app.use(express.json());
app.use(express.urlencoded());

const port = 3000;

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname+'/index.html'));
})


app.post('/crawl', async (req, res) => {
    const url = req.body.url;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const hrefs = await functions.getAllHrefs(page);
    const uniqueHrefs = [... new Set(hrefs)];
    uniqueHrefs.push(url);
    let i = 1;
    
    while (uniqueHrefs.length > 0) {
        const page2 = await browser.newPage();
        try {
            console.log('going to ' + uniqueHrefs[uniqueHrefs.length-1]);
            await page2.goto(uniqueHrefs[uniqueHrefs.length-1]);
        } catch(e) {
            console.log(e);
        }
        
        try {
            dataObj = {};
            dataObj['price'] = await functions.getPrice(page, req.body.price);
            dataObj['name'] = await page2.$eval(req.body.name, n => n.textContent);
            dataObj['url'] = uniqueHrefs[uniqueHrefs.length-1];
            const csv = new ObjectsToCsv([dataObj]); 
            await csv.toDisk('./products.csv', { append : true});
            console.log("YESPRODUI");
            i++;
        } catch (e) {
            console.log('nope');
        }
        uniqueHrefs.pop();
        await page2.close();
        console.log(uniqueHrefs.length);
    }
    
    await page.close();
    await browser.close();
    res.send("ok");
})


app.post('/crawl-one', async (req, res) => {
    const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36';
    const userAgent = randomUserAgent.getRandom();
    const UA = userAgent || USER_AGENT;
    console.log(UA);

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920 + Math.floor(Math.random() * 100),
        height: 3000 + Math.floor(Math.random() * 100),
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: false,
        isMobile: false,
    });
    console.log("after viewport");
    await page.setUserAgent(UA);
    await page.setJavaScriptEnabled(true);
    await page.setDefaultNavigationTimeout(0);

    await page.setRequestInterception(true);
    await page.on('request', (req) => {
        console.log("requests");
        if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        } else {
            req.continue();
        }
    });
    console.log("after req block");


    await page.evaluateOnNewDocument(() => {
        console.log("1");
        Object.defineProperties(navigator, 'webdriver', {
            get: () => false
        })
    });

    await page.evaluateOnNewDocument(() => {
        console.log("2");
        window.chrome = {
            runtime : {}
        }
    });

    await page.evaluateOnNewDocument(() =>{
        console.log("3");
        const originalQuery = window.navigator.permissions.query;
        return windwow.navigator.permissions.query = (parameters) => {
            parameters.name == 'notifications' ?
                Promise.resolve({state: Notification.permission}) :
                originalQuery(parameters);
        }
    });

    await page.evaluateOnNewDocument(() => {
        console.log("4");
        Object.defineProperties(navigator, 'plugins', {
            get : () => [1, 2, 3, 4, 5],
        });
    });

    await page.evaluateOnNewDocument(() => {
        console.log("5");
        Object.defineProperty(navigator, 'languages', {
            get: () => ['fr-FR', 'fr'],
        });
    });

    const cookies = await page.cookies(req.body.url);
    await page.deleteCookie(...cookies);
    await page.goto(req.body.url, { waitUntil: 'networkidle2',timeout: 0 });
    // const dataObj = await functions.scanOneUrl(page, req.body.price, req.body.name);
    await page.screenshot({path:'test.png'});
    // await page.close();
    // await browser.close();
    
    // const csv = new ObjectsToCsv(datas);
    // await csv.toDisk('./product.csv');
    res.send("OK");
});


app.get('/test', (req, res) => {
    const file = "C:/Users/camil/OneDrive/Bureau/expresspuppet/products.csv";
    const products = csv.toOjects(file);
    res.send(products);
});

app.listen(port, () => {
    console.log("poney");
});