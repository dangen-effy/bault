/**
 * `agent` 는 `bault` 를 실행시키는 주체이며 작업을 요청합니다.
 */

const axios = require('axios')
const { processCheck } = require('./killer')

require('colors')

req()

async function req () {
  try {
    await processCheck()

    const { data } = await axios.post('http://localhost:3000/record/start', { gId: process.argv[2] })

    console.log('[Response]'.green, data)

    await req()
  } catch (error) {
    console.error(error)
  }
}
