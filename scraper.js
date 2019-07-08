const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const links = require('./links.js')

let counter = 0000;

const scrapeImageProps = async (url) => {

    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(url);
        const el = await page.$('#main > div.grid-container > div > section.pd-holder.met-product.grid-100.grid-parent.v-spacing-jumbo > div.pd-left.grid-50.tablet-grid-50.grid-parent > div.grid-100.v-spacing-medium > div.pd-image-holder.grid-85.tablet-grid-80 > a > img');  
    
        const scrapedImg = {};
        scrapedImg.scrapedName = await el.getProperty('alt');
        scrapedImg.scrapedSrc = await el.getProperty('src');
        
        browser.close();
        return scrapedImg;
    } catch(err) {
        alert(err);
    }
};

const asyncDownload = (url, destination) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(resolve(true));
        });
    })
    .on('error', (err) => {
        fs.unlink(destination);
        reject(error.message);
    })
});


const downloadImg = (url) => {
    scrapeImageProps(url).then((scrapedImg) => {
        let name = scrapedImg.scrapedName._remoteObject.value;
        const src = scrapedImg.scrapedSrc._remoteObject.value;
        
        let reg = / +/g;
        name = name.replace(reg, '-');
        const image = { name, src };
        
        asyncDownload(image.src, `./scrapedImages/${image.name}.png`);
    }).then(() => {
        console.log(counter);
    }).catch((err) => {
        throw(err);
    });
};

const loopImgScrape = async (scraper, linksArr) => {
    for (let i = 0; i < linksArr.length; i++) {
        const url = linksArr[i];
        counter++;
        console.log('test');
        const img = await scraper(url);
    }
};


loopImgScrape(downloadImg, links);