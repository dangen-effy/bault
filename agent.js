const axios = require('axios')

req()

async function req () {
  try {
    const { data } = await axios.post('http://localhost:3000/record/start')
    console.log('[Response]', data)

    await req()
  } catch (error) {
    console.log(error)
  }
}
