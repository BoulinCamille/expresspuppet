const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const functions = require('./functions')
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');

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
    const preloadFile = fs.readFileSync('./preload.js', 'utf8');
    
    const args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];

    const options = {
        args,
        headless: true,
        ignoreHTTPSErrors: true,
        userDataDir: "./Default"
    };

    let datas = [];
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(preloadFile);
    await page.goto(req.body.url);
    await page.setRequestInterception(true);
    page.on("request", r => {
        if (
          ["image", "stylesheet", "font", "script"].indexOf(r.resourceType()) !== -1 
        ) {
          r.abort();
        } else {
          r.continue();
        }
      });
    const dataObj = await functions.scanOneUrl(page, req.body.price, req.body.name);
    datas.push(dataObj);

    await page.close();
    await browser.close();
    
    const csv = new ObjectsToCsv(datas);
    await csv.toDisk('./product.csv');
    res.send(dataObj);
});


app.get('/test', (req, res) => {
    const file = "C:/Users/camil/OneDrive/Bureau/expresspuppet/products.csv";
    const products = csv.toOjects(file);
    res.send(products);
});

app.listen(port, () => {
    console.log("poney");
});