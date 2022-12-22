const {
    connect,
    d,
    clear
} = require("./index.js")

async function main() {
    await connect("Test", "127.0.0.1", 0, {
        open: false
    })
    clear()

    d("Start")
    for (let i = 0; i < 25; i++) {
        console.log(i)
        d(i, {
            a: 1,
            b: 2,
            c: 3
        }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    }
    d("End")
}

main()