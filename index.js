const {
    v4: uuidv4
} = require('uuid')
const childProcess = require('child_process')
const open = require('open')
const axios = require('axios')
const connection = require('./connection')

const id = uuidv4()

global[id] = {
    stackLimit: 10,
    host: "",
    port: 0
}

function deep_stringify(obj, stack = 0) {
    var json = ''

    if (stack > global[id].stackLimit)
        return "\"STACK_LIMIT_REACHED\""
    else if (obj instanceof Array) {
        json += '['
        for (var i = 0; i < obj.length; i++) {
            json += deep_stringify(obj[i], stack + 1)
            if (i < obj.length - 1)
                json += ', '
        }
        json += ']'
    } else if (obj instanceof Object) {
        json += '{'
        var keys = Object.keys(obj)
        for (var i = 0; i < keys.length; i++) {
            json += '"' + keys[i] + '": ' + deep_stringify(obj[keys[i]], stack + 1)
            if (i < keys.length - 1)
                json += ', '
        }
        json += '}'
    } else if (typeof obj === 'string')
        json += '"' + obj + '"'
    else if (typeof obj === 'number' || typeof obj === 'boolean')
        json += obj
    else
        json += "null"
    return json
}

module.exports = {
    connect: async (name = 'Debug', host = '127.0.0.1', _port = 0) => {
        const {
            port,
            pid
        } = await connection(host, _port)

        if (pid > 0)
            console.log(`Process ${pid} is already running on port ${port}`)
        else { // means the process has to be created
            child = childProcess.fork(__dirname + "/server.js", [name, host, port], {
                detached: true
            })
            console.log(`Create new process (${child.pid}) running on port ${port}`)
            child.unref()
            open(`http://${host}:${port}`)
        }

        var isReady = false

        console.log(`Waiting to connect to http://${host}:${port}...`)

        while (!isReady) {
            await axios.get(`http://${host}:${port}/ping`)
                .then(res => isReady = res.data === 'pong' ? true : false)
                .catch(err => {})
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        global[id].host = host
        global[id].port = port

        console.log(`Connected to http://${host}:${port}`)
    },
    d: async (...args) => axios.post(`http://${global[id].host}:${global[id].port}/addSeveralData`, deep_stringify(args), {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .catch(err => {}),
    clear: async () =>
        axios
        .post(
            `http://${global[id].host}:${global[id].port}/addAction`, {
                action: "clear"
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
        .catch(err => {}),
    set_stack_limit: (limit) => {
        global[id].stackLimit = limit
    }
}