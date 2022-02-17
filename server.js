const express = require('express')
const app = express()
const port = process.env.PORT

app.use(express.static('public'))

const people = []
const cbs = []

app.get('/e', async function(req, res) {
  const {name = "Guest"} = req.body
  
  people.push(name)
  
  for (const cb of cbs) cb()
  
  cb.push(() => {
    
  })
  
  console.log('Got /events');
  res.set({
    'Cache-Control': 'no-cache',
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive'
  });
  res.flushHeaders();

  // Tell the client to retry every 10 seconds if connectivity is lost
  res.write('retry: 10000\n\n');
  let count = 0;

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Emit', ++count);
    // Emit an SSE that contains the current 'count' as a string
    res.write(`data: ${count}\n\n`);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
