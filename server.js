const express = require("express")
const app = express()

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
    res.send(`
    <script>
        document.title = "${name}"
        setInterval(() => {
            fetch("/fetch")
                .then(res => res.json())
                .then(data => {
                  if (data.type === "several")
                    console.debug(...data.data)
                  else if (data.type === "single")
                    console.debug(data.data)
                })
            .catch(err => {})
        }, 2000)
    </script>
    `)
})

app.get("/fetch", (req, res) => {
    res.json(app.locals.queue.shift())
})

app.post("/addSeveral", (req, res) => {
    app.locals.queue.push({
        type: "several",
        data: req.body
    })
    res.status(200).send("OK")
})

app.post("/add", (req, res) => {
    app.locals.queue.push({
        type: "single",
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