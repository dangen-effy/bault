const fs = require('fs')
const { concat } = require('./studio')

fs.watch('videos', (event, file) => {
  if (event === 'change') {
    console.log('[Watcher] Recording done detected', file)
    concat(file, file)
  }
})
