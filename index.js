const app = require('express')()
const robot = require('robotjs')

const { Datastore } = require('nedb-async-await')
const db = new Datastore({ filename: 'db/data', autoload: true })

app.post('/record/start', async (_, res) => {
  const replays = await db.find({ recorded: false })
  const [replay] = replays
  const { gId, duration } = replay

  setTimeout(stop, 1500, replay.gId)
  robot.keyTap('f7')
  res.send(`${gId} ${duration} Record started`)
})

app.listen(3000)

async function stop (gId) {
  robot.keyTap('f8')
  db.update({ gId }, { $set: { recorded: true } }, {})
  console.log(gId, 'Recording done')
}
