document.title = "${name} | Debugger"

setInterval(() => {
    fetch("/fetch")
        .then(res => res.json())
        .then(data => {
            if (data.type === "action") {
                switch (data.action) {
                    case "clear":
                        console.clear()
                        break
                    default:
                        console.error("Unknown action: " + action)
                }
            } else if (data.type === "data") {
                if (data.subType === "several")
                    console.debug(...data.data)
                else if (data.subType === "single")
                    console.debug(data.data)
            }
        })
        .catch(err => {})
}, 2000)