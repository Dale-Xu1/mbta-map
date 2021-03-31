import express from "express"
import dotenv from "dotenv"

class App
{

    private app = express()


    public constructor(port: string)
    {
        this.app.use(express.static("build"))

        // Start server
        this.app.listen(port)
    }

}

// Initialize environment variables
dotenv.config()
let port = process.env.PORT!

new App(port)
console.log(`Server running on port ${port}`)
