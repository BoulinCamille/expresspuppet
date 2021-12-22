const express = require('express');
const path = require('path');
const functions = require('./functions')
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const mongoose = require('mongoose');
const Site = require("./models/Site");



mongoose.connect('mongodb://127.0.0.1:27017/project_db', { useUnifiedTopology: true, useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.once('open', () => {
    console.log("connecte a mongoose");
});

const app = express();


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');


app.use(express.json());
app.use(express.urlencoded());

const port = 3000;

app.get("/", (req, res) => {
    res.status(200).sendFile(path.join(__dirname+'/index.html'));
})


app.post('/crawl', async (req, res) => {
    const url = req.body.url;
    const browser = await functions.createBrowser();
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


    const browser = await functions.createBrowser();

    const page = await browser.newPage();

    await page.goto(req.body.url, { waitUntil: 'networkidle2',timeout: 0 });
    const dataObj = await functions.scanOneUrl(req.body.url, req.body.price, req.body.name);
    await page.screenshot({path:'test.png'});
    await page.close();
    await browser.close();
    
    // const csv = new ObjectsToCsv(datas);
    // await csv.toDisk('./product.csv');
    res.send(dataObj);
});


app.get('/pd', async (req, res) => {
    const data = {
        url_si: "https://www.test.com",
        nom_si: "test.com"
    };
    const site = await new Site(data);
    console.log(site);
    site.save((err, site) => {
        if (err) return console.log(err)
        console.log(site.nom_si + " ajoute a la collection");
    });

    res.send("OK");
});



app.listen(port, (err) => {
    if (err) console.log(err);
    console.log("poney");
});