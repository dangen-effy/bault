const { snapshot } = require('process-list')
const _ = require('lodash')

module.exports = () => {
  snapshot('pid', 'name').then(tasks => {
    const { pid } = _.filter(tasks, (o) => { return o.name === 'League of Legends.exe' }).pop()
    process.kill(pid, 'SIGINT')
  })
}
