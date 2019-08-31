const _ = require('lodash')
const path = require('path')
const express = require('express')
const robot = require('robotjs')
const { kill } = require('./killer')

const { client } = require('./youtube')
const { exec } = require('child_process')
const { Datastore } = require('nedb-async-await')
const { NODE_ENV } = process.env

const Replay = new Datastore({ filename: 'db/replays', autoload: true })
const Second = 1000
const app = express()
const uploader = client()

require('./watcher')
require('colors')

app.use(express.json())

app.get('/oauth2callback', async (req, res, next) => {
  try {
    const { code } = req.query
    const { tokens } = await uploader.oauthClient.getToken(code)

    uploader.oauthClient.credentials = tokens

    await uploader.upload('sample.ts')

    res.send('Uploaded1')
  } catch (e) {
    next(e)
  }
})

app.get('/upload', async (req, res, next) => {
  try {
    await uploader.authenticate()
  } catch (e) {
    next(e)
  }
})

app.post('/record/start', async (req, res, next) => {
  try {
    let replays

    if (req.body.gId) {
      const { gId } = req.body

      replays = await Replay.find({ recorded: false, gId })
    } else {
      replays = await Replay.find({ recorded: false })
    }

    if (!replays.length) { throw new Error('No replays left') }

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

      return res.send({ gId, duration })
    })
  } catch (e) {
    next(e)
  }
})

app.use((error, _, res, __) => {
  console.error(error.stack)

  res.status(500).send({ error: error.message || 'An error occured' })
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
    await Replay.update({ gId }, { $set: { recorded: true } }, {})

    console.log('[Record-Done]'.magenta, gId, now())

    kill()
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

  _.times(6, () => {
    robot.keyToggle(key, 'down')
    robot.keyToggle(key, 'up')
  })
}
