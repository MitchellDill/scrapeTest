const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const links = require('./imageLinks.js')

const scrapeLowesImages = async (urls) => {

    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 1000})
        const jsonScrapings = {};


        for (let i = 0; i < urls.length; i++) {
            await page.goto(urls[i]);
            const el = await page.$(`#main > div.grid-container > div > 
            section.pd-holder.met-product.grid-100.grid-parent.v-spacing-jumbo > 
            div.pd-left.grid-50.tablet-grid-50.grid-parent > div.grid-100.v-spacing-medium > 
            div.pd-image-holder.grid-85.tablet-grid-80 > a > img`);
            
            
            const scrapedName = await el.getProperty('alt');
            const scrapedSrc = await el.getProperty('src');
            const scrapedImgProps = { scrapedName, scrapedSrc };
            const image = formatImgProps(scrapedImgProps);
            image.id = i + 1;

            const el2 = await page.$(`#mainContent > ul > li:nth-child(1) > a > span`);
            const scrapedCategory = await (await el2.getProperty('textContent')).jsonValue();
            image.category = scrapedCategory;

            const el3 = await page.$(`#mainContent > ul > li:last-child > a > span`);
            const scrapedSubCategory = await (await el3.getProperty('textContent')).jsonValue();
            image.subCategory = scrapedSubCategory;

            jsonScrapings[image.id] = image;

            console.log(scrapedCategory);
            console.log(scrapedSubCategory);
            console.log(`${i} loop is done`);
        }
        
        await asyncWriteFile(JSON.stringify(jsonScrapings), `./scrapedData/scrapings.json`);

    } catch(err) {
        console.log('in scrape: ', err);
    } finally {
        browser.close();
    }
};

const asyncWriteFile = (file, destination) => new Promise((resolve, reject) => {
    fs.writeFile(destination, file, (err) => {
        if (err) {
            reject(err);
        } else {
            resolve(true);
        }
    });
});


const formatImgProps = (scrapedImg) => {
    let reg = /[ :/.?]+/g;
    let name = scrapedImg.scrapedName._remoteObject.value;
    name = name.replace(reg, '-');
    const src = scrapedImg.scrapedSrc._remoteObject.value;    
    const image = { name, src };
    return image;
};      


scrapeLowesImages(links.linksArray);