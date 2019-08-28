/**
 * `studio` 는 `ffmpeg` 을 사용해 비디오를 직접 편집합니다.
 */

const _ = require('lodash')
const fs = require('fs')
const shell = require('shelljs')

require('colors')

const resultPath = 'videos/results/'

fs.existsSync(resultPath) || fs.mkdirSync(resultPath)

function concat ({ intro, outro }, ...videos) {
  const vids = _.map(videos, (video) => {
    return `videos/${video}`
  })

  let joinnedVideo = vids.join('|')

  intro && (intro += '|')
  outro && (joinnedVideo += '|')

  const concat = `${intro || ''}${joinnedVideo}${outro || ''}`

  if (shell.exec(`ffmpeg -loglevel error -i "concat:${concat}" -codec copy ${resultPath}${_.last(videos)}`).code !== 0) {
    console.error('[Studio] Error on ffmpeg concat'.red, concat.yellow)
  } else {
    console.log('[Studio] concat done'.green, concat.yellow)
  }
}

module.exports = {
  concat
}
