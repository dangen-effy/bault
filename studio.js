const shell = require('shelljs')

function concat (...videos) {
  if (shell.exec(`ffmpeg -loglevel error -i "concat:${videos.join('|')}" -codec copy result.ts`).code !== 0) {
    console.error('[ffmpeg] Error on ffmpeg concat', videos)
  } else {
    console.log('[ffmpeg] concat done', videos)
  }
}

module.exports = {
  concat
}
