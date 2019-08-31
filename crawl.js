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

    page.setCacheEnabled(false)

    page.on('console', consoleObj => console.log(consoleObj.text()))

    await page.goto(url, {
      waitUntil: 'domcontentloaded'
    })

    await crawl(page, player)
  }))

  await browser.close()
})()

async function crawl (page, player) {
  fs.existsSync(files) || fs.mkdirSync(files)

  const replays = await page.$$eval('div.GameItem.Win', ele => {
    return ele.map(e => {
      const gId = e.getAttribute('data-game-id')
      const duration = e.getElementsByClassName('GameLength')[0].innerHTML
      const timeAgo = e.getElementsByClassName('_timeago')[0].innerHTML

      if (timeAgo.includes('days') && parseInt(timeAgo) > 2) {
        return
      }

      return { gId, duration }
    }).filter(exist => exist)
  })

  await Promise.all(_.map(replays, async (replay) => {
    const { gId, duration } = replay
    const exist = await Replay.findOne({ gId })

    if (exist) {
      console.warn(gId.yellow, 'Already exist!'.red)
      return
    }

    await Replay.insert({ gId, duration, player, recorded: false })
    await saveReplay(gId)
    await replace(radsOptions)
    await replace(localeOption)
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
