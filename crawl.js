const { Datastore } = require('nedb-async-await')
const puppeteer = require('puppeteer')
const replace = require('replace-in-file')
const https = require('https')
const fs = require('fs')

const db = new Datastore({ filename: 'db/data', autoload: true })

const files = __dirname + '/replays'

const { faker, from, to } = require('./config')

const options = {
  files: files + '/*.bat',
  from,
  to
}

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(faker, {
    waitUntil: 'domcontentloaded'
  })

  const result = await page.$$eval('div.GameItem.Win', ele => {
    return ele.map(e => {
      const gId = e.getAttribute('data-game-id')
      const duration = e.getElementsByClassName('GameLength')[0].innerHTML

      return { gId, duration }
    })
  })

  if (!fs.existsSync(files)) {
    fs.mkdirSync(files)
  }

  for (const it of result) {
    const { gId, duration } = it
    const result = await db.findOne({ gId: it.gId })

    if (!result) {
      await db.insert({ gId, recorded: false, duration })
      await saveReplay(it.gId)
      await replace(options)
    } else {
      console.log(gId, 'Already exist!')
    }
  }

  await browser.close()
})()

function saveReplay (name) {
  return new Promise((resolve, reject) => {
    console.log('Saved!')
    const file = fs.createWriteStream(__dirname + `/replays/${name}.bat`)
    const req = https.get(`https://www.op.gg/match/new/batch/id=${name}`)

    req.on('response', res => {
      res.pipe(file)
      resolve(res)
    })

    req.on('error', err => {
      reject(err)
    })
  })
}
