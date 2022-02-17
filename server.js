/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/
const path = require("path");

const fastify = require("fastify")({
  logger: false
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

fastify.register(require("fastify-sse"), (err) => {
    if (err) {
      throw err;
    }
});

const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

const people = []
const cbs = []

fastify.post("/p", (req, res) => {
  const {name} = req.body
  if (!name) 
    name = "Guest";
  
  res.sse("people", people)
  
  people.push(name)
  
  const cb = () => res.sse("people", people)
  cbs.push(cb)
})

fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    console.log("death")
    console.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});