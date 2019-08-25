const _ = require('lodash')
const path = require('path')
const app = require('express')()
const robot = require('robotjs')
const { Datastore } = require('nedb-async-await')
const { exec } = require('child_process')
const db = new Datastore({ filename: 'db/data', autoload: true })
const killer = require('./killer')

app.post('/record/start', async (req, res, next) => {
  // TODO: 리플레이 다 떨어졌을때 자동 크롤링해서 데이터 갱신
  try {
    const replays = await db.find({ recorded: false })
    const [replay] = replays
    const { gId, duration } = replay
    const ms = getDurationAsMilli(duration)
    req.setTimeout(ms + 1000 * 60)

    const batchPath = path.join(__dirname, `/replays/${gId}.bat`)

    console.log('[Exec]', batchPath)
    console.log('[Record-Start]', gId, ms, now())

    tap('f7')

    setTimeout(stop, ms, replay.gId)

    exec(batchPath, err => {
      if (err) {
        throw err
      }
      console.log('[Kill]', batchPath)
      tap('f8')

      // TODO: 유튜브 업로드
      // TODO: 다음 태스크 진행은 에이전트가 하는걸로
      return res.send({ done: true, msg: `${gId} ${duration} ${ms} Record Start` })
    })
  } catch (e) {
    next(e)
  }
})

app.use((err, _, res, __) => {
  console.error(err.stack)
  res.status(500).send({ err })
})

app.listen(3000)

process.on('SIGINT', exit)
process.on('SIGUSR1', exit)
process.on('SIGUSR2', exit)
process.on('uncaughtException', exit)

async function stop (gId) {
  try {
    db.update({ gId }, { $set: { recorded: true } }, {})
    console.log('[Record-Done]', gId, now())
    killer()
  } finally {
    tap('f8')
  }
}

function exit () {
  tap('f8')
  process.exit()
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
  robot.keyToggle(key, 'down')
  robot.keyToggle(key, 'up')
  robot.keyToggle(key, 'down')
  robot.keyToggle(key, 'up')
  robot.keyToggle(key, 'down')
  robot.keyToggle(key, 'up')
}
