import express from "express"

class App
{

    private app = express()


    public constructor(port: string | number)
    {
        this.app.use(express.static("build"))

        // Start server
        this.app.listen(port)
    }

}

let port = process.env.PORT || 5000

new App(port)
console.log(`Server running on port ${port}`)
