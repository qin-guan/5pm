const express = require('express')
const app = express()
const port = process.env.PORT

app.use(express.static('public'))

const people = []
const cbs = []

app.get('/e', async function(req, res) {
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  let {name = "Guest"} = req.query
  if (name.length === 0) name = "Guest"
  
  const idx = people.length
  const cbsidx = cbs.length
  people.push(name)
  
  cbs.push(() => {
    res.write(`data: ${JSON.stringify({type: 'people', people})}\n\n`)
  })
  
  req.on('close', () => {
    people.pop(idx)
    cbs.pop(cbsidx)
    for (const cb of cbs) cb()
  })
  
  for (const cb of cbs) cb()
  
  res.write('retry: 1000\n\n');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
