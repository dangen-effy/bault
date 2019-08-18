const _ = require('lodash')
const path = require('path')
const app = require('express')()
const robot = require('robotjs')
const { Datastore } = require('nedb-async-await')
const { exec } = require('child_process')
const db = new Datastore({ filename: 'db/data', autoload: true })
const killer = require('./killer')

app.post('/record/start', async (_, res) => {
  // TODO: 리플레이 다 떨어졌을때 자동 크롤링해서 데이터 갱신
  const replays = await db.find({ recorded: false })
  const [replay] = replays
  const { gId, duration } = replay
  const ms = getDurationAsMilli(duration)

  const batchPath = path.join(__dirname, `/replays/${gId}.bat`)

  console.log('[Exec]', batchPath)
  console.log('[Record-Start]', gId, now())

  tap('f7')

  setTimeout(stop, 20000, replay.gId)

  exec(batchPath, err => {
    if (err) {
      throw err
    }
    console.log('[Kill]', batchPath)

    // TODO: 유튜브 업로드
  })

  return res.send(`${gId} ${duration} ${ms} Record Start`)
})

app.listen(3000)

async function stop (gId) {
  tap('f8')

  db.update({ gId }, { $set: { recorded: true } }, {})
  console.log('[Record-Done]', gId, now())
  killer()
}

function getDurationAsMilli (duration) {
  const [mm, ss] = _.map(duration.split(' '), (x) => {
    return x.slice(0, -1)
  })

  const m = mm * 60 * 1000
  const s = ss * 1000

  return m + s
}

function now () {
  return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}

function tap (key) {
  robot.keyToggle(key, 'down')
  robot.keyToggle(key, 'up')
  robot.keyToggle(key, 'down')
  robot.keyToggle(key, 'up')
  robot.keyToggle(key, 'down')
  robot.keyToggle(key, 'up')
}
