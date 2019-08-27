const shell = require('shelljs')
const _ = require('lodash')

const fs = require('fs')
var resultPath = 'videos/results/'

fs.existsSync(resultPath) || fs.mkdirSync(resultPath)

function concat (...videos) {
  videos = _.map(videos, (video) => {
    return `videos/${video}`
  })

  // TODO: 앞에 무조건 videos 붙이면 폴더 구조에 제약 생김
  if (shell.exec(`ffmpeg -loglevel error -i "concat:${videos.join('|')}" -codec copy ${resultPath}${_.last(videos)}.ts`).code !== 0) {
    console.error('[Studio] Error on ffmpeg concat', videos)
  } else {
    console.log('[Studio] concat done', videos)
  }
}

module.exports = {
  concat
}
