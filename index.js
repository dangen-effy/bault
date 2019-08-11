const app = require('express')();

app.post('/record/start', async (req, res) => {
  console.log('haha');
});

app.listen(3000);
