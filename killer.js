/**
 * `killer` 는 실행중인 리그오브레전드 프로세서를 찾아 죽입니다.
 */

const _ = require('lodash')

const { snapshot } = require('process-list')

module.exports = () => {
  snapshot('pid', 'name').then(tasks => {
    const { pid } = _.filter(tasks, (o) => { return o.name === 'League of Legends.exe' }).pop()
    process.kill(pid, 'SIGINT')
  })
}
