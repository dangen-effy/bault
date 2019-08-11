const Datastore = require('nedb')
const db = new Datastore({ filename: 'db/data', autoload: true })
// You can issue commands right away

db.replay = new Datastore('db/replay')

db.insert([{ a: 5 }, { a: 42 }], function (_, newDoc) {
  console.log(newDoc)
})
