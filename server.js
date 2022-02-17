const express = require('express')
const app = express()
const port = process.env.PORT

app.use(express.static('public'))

const people = {}
const cbs = []

function event() {
  for (const cb of cbs) cb()
}

app.get('/e', async function(req, res) {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  let {name = "Guest", id} = req.query
  if (!id) {
    res.end();
    return
  }
  
  if (name.length === 0) name = "Guest"
  
  const cbsidx = cbs.length
  people[id] = name
  
  cbs.push(() => {
    res.write(`data: ${JSON.stringify({type: 'people', people: Object.values(people)})}\n\n`)
  })
  
  req.on('close', () => {
    delete people[id]
    cbs.pop(cbsidx)
    event()
  })

  event()
  
  res.write('retry: 1000\n\n');
});

app.post('/name', function(req, res) {
  console.log(req)
  const {name = "Guest", id} = req.body
  if (!id || !people[id]) {
    res.end();
    return;
  }
  
  people[id] = name;
  event()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
