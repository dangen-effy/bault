const _ = require('lodash')
const path = require('path')
const app = require('express')()
const robot = require('robotjs')
const killer = require('./killer')
const { exec } = require('child_process')
const { Datastore } = require('nedb-async-await')
const { NODE_ENV } = process.env
const Replay = new Datastore({ filename: 'db/replays', autoload: true })
const Second = 1000

require('./watcher')

app.post('/record/start', async (req, res, next) => {
  // TODO: 리플레이 다 떨어졌을때 자동 크롤링해서 데이터 갱신
  try {
    const replays = await Replay.find({ recorded: false })
    const [replay] = replays
    const { gId, duration } = replay
    const gameTime = getDurationAsMilli(duration)

    req.setTimeout(gameTime + 60 * Second)

    const batchPath = path.join(__dirname, `/replays/${gId}.bat`)

    console.log('[Exec]', batchPath.yellow)
    console.log('[Record-Start]'.magenta, gId, gameTime, now())

    setTimeout(start, 30 * Second)
    setTimeout(stop, gameTime - 10 * Second, replay.gId)

    exec(batchPath, err => {
      if (err) {
        throw err
      }

      console.log('[Exit]'.magenta, batchPath.yellow)
      tap('f8')

      return res.send({ done: true, video: { gId, duration } })
    })
  } catch (e) {
    next(e)
  }
})

app.use((err, _, res, __) => {
  console.error(err.stack)
  res.status(500).send({ err })
})

app.listen(3000, () => { console.log('🚀 ', now()) })

process.on('SIGINT', exit)
process.on('SIGUSR1', exit)
process.on('SIGUSR2', exit)
process.on('uncaughtException', exit)

async function start () {
  tap('f7')
}

async function stop (gId) {
  try {
    Replay.update({ gId }, { $set: { recorded: true } }, {})
    console.log('[Record-Done]'.magenta, gId, now())
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
  if (!NODE_ENV) return 60 * Second

  const [mm, ss] = _.map(duration.split(' '), x => {
    return x.slice(0, -1)
  })

  const m = mm * 60 * Second
  const s = ss * Second

  return m + s
}

function now () {
  return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}

function tap (key) {
  console.log('[Keyboard]'.gray, key, now())
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
