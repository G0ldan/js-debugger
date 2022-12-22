const {
    connect,
    d,
    clear
} = require("./index.js")

async function main() {
    await connect("Test", "", 0, {
        openOnStartup: false
    })
    await clear()
    await d("Hello world!!")
}

main()