const fs = require('fs')
const { concat } = require('./studio')

fs.watch('videos', (event, file) => {
  if (event === 'change' && file !== 'results') {
    console.log('[Watcher] Recording done detected', file)
    concat({ intro: 'videos/source/intro.ts', outro: 'videos/source/outro.ts' }, file)
  }
})
