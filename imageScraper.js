const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const links = require('./imageLinks.js')

const scrapeLowesImages = async (urls) => {

    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 1000})


        for (let i = 0; i < urls.length; i++) {
            await page.goto(urls[i]);
            const el = await page.$(`#main > div.grid-container > div > 
            section.pd-holder.met-product.grid-100.grid-parent.v-spacing-jumbo > 
            div.pd-left.grid-50.tablet-grid-50.grid-parent > div.grid-100.v-spacing-medium > 
            div.pd-image-holder.grid-85.tablet-grid-80 > a > img`);  
            
            const scrapedName = await el.getProperty('alt');
            const scrapedSrc = await el.getProperty('src');
            const scrapedImg = { scrapedName, scrapedSrc };
            const image = formatImgProps(scrapedImg);

            await asyncDownload(image.src, `./scrapedImages/${image.name}.png`);
            console.log(`${i} loop is done`);
        }

    } catch(err) {
        console.log('in scrape: ', err);
    } finally {
        browser.close();
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


const formatImgProps = (scrapedImg) => {
    let reg = /[ :/.?]+/g;
    let name = scrapedImg.scrapedName._remoteObject.value;
    name = name.replace(reg, '-');
    const src = scrapedImg.scrapedSrc._remoteObject.value;    
    const image = { name, src };
    return image;
};      


scrapeLowesImages(links.linksArray);