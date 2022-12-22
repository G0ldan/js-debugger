const express = require("express")
const app = express()
const fs = require("fs")

if (process.argv.length !== 5) {
    console.error("Invalid arguments")
    process.exit(1)
}

const name = process.argv[2]
const host = (process.argv[3] == 'localhost') ? '127.0.0.1' : process.argv[3]
const port = process.argv[4]

app.locals.queue = []
app.locals.lastPing = Date.now()

app.listen(port, host, () => {
    console.log(`Listening on ${host}:${port}`)
})

app.use(
    express.json({
        limit: '50mb'
    }),
    (req, res, next) => {
        app.locals.lastPing = Date.now()
        next()
    }
)

app.get("/", (req, res) => {
    const script = fs.readFileSync(__dirname + "/DOMscript.js", "utf8")
        .replace("${name}", name)

    res.send(`<script>${script}</script>`)
})

app.get("/fetch", (req, res) => {
    res.json(app.locals.queue.shift())
})

app.post("/addAction", (req, res) => {
    app.locals.queue.push({
        type: "action",
        action: req.body.action
    })
    res.status(200).send("OK")
})

app.post("/addSeveralData", (req, res) => {
    app.locals.queue.push({
        type: "data",
        subType: "several",
        data: req.body
    })
    res.status(200).send("OK")
})

app.post("/addSingleData", (req, res) => {
    app.locals.queue.push({
        type: "data",
        subType: "single",
        data: req.body
    })
    res.status(200).send("OK")
})

app.get("/ping", (req, res) => {
    res.status(200).send("pong")
})

app.get("/pid", (req, res) => {
    res.status(200).send(process.pid.toString())
})

setInterval(() => {
    if (Date.now() - app.locals.lastPing > 10000) process.exit()
})