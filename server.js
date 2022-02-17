/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/
const path = require("path");
const {FastifySSEPlugin} = require("fastify-sse-v2")

const fastify = require("fastify")({
  logger: false
});

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

fastify.register(FastifySSEPlugin)

const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

const people = []
const cbs = []

fastify.post("/p", (req, res) => {
  const {name = "Guest"} = req.body ?? {name: ""}
  
  for (const fn of cbs) {
    fn()
  }
  
  people.push(name)
  
  const cb = () => res.sse("people", people)
  cbs.push(cb)
})

fastify.listen(process.env.PORT, '0.0.0.0', function(err, address) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
});