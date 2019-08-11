const puppeteer = require('puppeteer');
const replace = require('replace-in-file');
const https = require('https');
const fs = require('fs');

const { faker, from, to } = require('./config');

const options = {
  files: __dirname + '/replays/*.bat',
  from,
  to
};

const gIDSelector = '//div[contains(@class, "GameItem Win")]/@data-game-id';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(faker, {
    waitUntil: 'domcontentloaded'
  });

  const htmls = await page.$x(gIDSelector);

  const gIDs = [];

  for (const document of htmls) {
    const rawProp = await document.getProperty('value');
    const jsonProp = await rawProp.jsonValue();
    gIDs.push(jsonProp);

    await req(jsonProp);
  }

  try {
    const results = await replace(options);
    c('Replacement results:', results);
  } catch (error) {
    console.error('Error occurred:', error);
  }

  await browser.close();
})();

const c = console.log;

function req(name) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(__dirname + `/replays/${name}.bat`);
    const req = https.get(`https://www.op.gg/match/new/batch/id=${name}`);

    req.on('response', res => {
      res.pipe(file);
      resolve(res);
    });

    req.on('error', err => {
      reject(err);
    });
  });
}
