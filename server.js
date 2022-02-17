const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT

app.use(express.static('public'))
app.use(bodyParser.json())

const people = {}
const reslist = []
const messages = []
const votes = [{
  5: 1
}]

function event() {
  for (const res of reslist) {
    if (res.writableEnded) continue
    res.write(`data: ${JSON.stringify({type: 'people', people: Object.values(people)})}\n\n`)
  }
}

function chatEvent(message, id) {
  for (const res of reslist) {
    if (res.writableEnded) continue
    res.write(`data: ${JSON.stringify({type: 'chat', message: message, person: people[id]})}\n\n`)
  }
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
  
  const cbsidx = reslist.length
  people[id] = name
  
  reslist.push(res)

  req.on('close', () => {
    delete people[id]
    event()
  })

  event()
  
  res.write('retry: 1000\n\n');
});

app.post('/name', function(req, res) {
  const {name = "Guest", id} = req.body
  if (!id || !people[id]) {
    res.end();
    return;
  }
  
  people[id] = name.length === 0 ? "Guest" : name;
  event()
  res.end()
})

app.get('/chat', function(req, res) {
  res.send(
    JSON.stringify(messages.map(m => ({message: m.message, person: people[m.id] || "Guest"})))
  )
})

app.get("/votes", function(req, res) {
  res.send(JSON.stringify(votes))
})

app.post('/chat', function(req, res) {
  const {message, id} = req.body
  if (!message || !id) {
    res.end()
    return
  }
  
  messages.push({message, id})
  chatEvent(message, id)
  res.end()
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
