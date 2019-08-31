const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const https = require('https')
const puppeteer = require('puppeteer')
const replace = require('replace-in-file')
const files = path.join(__dirname, '/replays')

const { Datastore } = require('nedb-async-await')
const { players, replacer } = require('./config')

const Replay = new Datastore({ filename: 'db/replays', autoload: true })

require('colors')

const radsOptions = {
  files: files + '/*.bat',
  from: replacer.radsFrom,
  to: replacer.radsTo
}

const localeOption = {
  files: files + '/*.bat',
  from: replacer.localeFrom,
  to: replacer.localeTo
}

;(async () => {
  const browser = await puppeteer.launch()

  await Promise.all(_.map(players, async (url, player) => {
    const page = await browser.newPage()
    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    })

    await crawl(page, player)
  }))

  await browser.close()
})()

async function crawl (page, player) {
  const result = await page.$$eval('div.GameItem.Win', ele => {
    return ele.slice(5).map(e => {
      const gId = e.getAttribute('data-game-id')
      const duration = e.getElementsByClassName('GameLength')[0].innerHTML
      return { gId, duration }
    })
  })

  fs.existsSync(files) || fs.mkdirSync(files)

  await Promise.all(_.map(result.slice(0, 3), async (it) => {
    const { gId, duration } = it
    const result = await Replay.findOne({ gId: it.gId })
    if (!result) {
      await Replay.insert({ gId, recorded: false, duration, player })
      await saveReplay(it.gId)
      await replace(radsOptions)
      await replace(localeOption)
    } else {
      console.log(gId.yellow, 'Already exist!'.red)
    }
  }))
}

function saveReplay (name) {
  return new Promise((resolve, reject) => {
    console.log('Saved!'.cyan)

    const file = fs.createWriteStream(
      path.join(__dirname, `/replays/${name}.bat`)
    )

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
