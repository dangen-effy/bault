/**
 * `watcher` 는 비디오 폴더를 감시해 동영상 편집을 `studio` 에게 지시하고 결과물을 유튜브로 업로드합니다.
 */

const fs = require('fs')

// const { concat } = require('./studio')

fs.watch('videos', (event, file) => {
  if (event === 'change' && file !== 'results') {
    console.log('[Watcher] Recording done detected'.bgGreen, file.yellow)
    // concat(file)
    // concat({ intro: 'videos/source/intro.ts', outro: 'videos/source/outro.ts' }, file)
  }
})
