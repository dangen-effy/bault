const shell = require('shelljs')
const _ = require('lodash')

const fs = require('fs')
var resultPath = 'videos/results/'

fs.existsSync(resultPath) || fs.mkdirSync(resultPath)

function concat ({ intro, outro }, ...videos) {
  const vids = _.map(videos, (video) => {
    return `videos/${video}`
  })

  let joinnedVideo = vids.join('|')

  intro && (intro += '|')
  outro && (joinnedVideo += '|')

  const concat = `${intro || ''}${joinnedVideo}${outro || ''}`

  // TODO: 앞에 무조건 videos 붙이면 폴더 구조에 제약 생김
  if (shell.exec(`ffmpeg -loglevel error -i "concat:${concat}" -codec copy ${resultPath}${_.last(videos)}`).code !== 0) {
    console.error('[Studio] Error on ffmpeg concat', concat)
  } else {
    console.log('[Studio] concat done', concat)
  }
}

module.exports = {
  concat
}
