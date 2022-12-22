const net = require("net")
const server = net.createServer()
const axios = require("axios")

async function is_port_available(_port) {
    return new Promise((resolve, reject) => {
        server.unref()
        server.on("error", () => resolve(0))
        server.listen(_port, () => {
            const {
                port
            } = server.address()
            server.close(() => resolve(port))
        })
    })
}

async function is_port_already_used(host, port) {
    const isAvailable = await axios
        .get(`http://${host}:${port}/ping`)
        .then(res => (res.data === "pong" ? true : false))
        .catch(err => false)

    if (isAvailable) {
        const pid = await axios
            .get(`http://${host}:${port}/pid`)
            .then(res => res.data)
            .catch(err => -1)
        if (pid > 0) {
            return {
                port: port,
                pid: pid
            }
        }
    }
    return false
}

async function connection(host, port) {
    const defautPorts = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010]

    if (port > 0) {
        if (await is_port_already_used(host, port))
            return await is_port_already_used(host, port)
        else if (await is_port_available(port)) {
            return {
                port: port,
                pid: -1
            }
        }
    }

    for (let i = 0; i < defautPorts.length; i++) {
        if (({
                pid
            } = await is_port_already_used(host, defautPorts[i])))
            return {
                port: defautPorts[i],
                pid: pid
            }
    }
    for (let i = 0; i < defautPorts.length; i++) {
        if (await is_port_available(defautPorts[i]))
            return {
                port: defautPorts[i],
                pid: -1
            }
    }
    return await is_port_available(0)
}

module.exports = connection