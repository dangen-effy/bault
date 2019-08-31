/**
 * `killer` 는 실행중인 리그오브레전드 프로세서를 찾아 죽입니다.
 */

const _ = require('lodash')

const { snapshot } = require('process-list')

function kill (processName = 'League of Legends.exe') {
  snapshot('pid', 'name').then(tasks => {
    const { pid } = _.filter(tasks, (o) => { return o.name === processName }).pop()

    process.kill(pid, 'SIGINT')
  })
}

async function processCheck (processName = 'obs64.exe') {
  const tasks = await snapshot('pid', 'name')

  if (!_.some(tasks, (o) => { return o.name === processName })) {
    throw new Error(`No ${processName} running`)
  }
}

module.exports = {
  kill, processCheck
}
