import express, { Request, Response } from "express"
import dotenv from "dotenv"
import axios from "axios"

import VehicleType from "./VehicleType"

class App
{

    private static URL = "https://api-v3.mbta.com"

    private static ALL = [VehicleType.LIGHT_RAIL, VehicleType.HEAVY_RAIL, VehicleType.COMMUTER_RAIL, VehicleType.BUS, VehicleType.FERRY].join(",")
    private static NO_BUS = [VehicleType.LIGHT_RAIL, VehicleType.HEAVY_RAIL, VehicleType.COMMUTER_RAIL, VehicleType.FERRY].join(",")

    
    private app = express()


    public constructor(port: string)
    {
        this.app.use(express.static("build"))
        this.app.use(express.json())

        this.app.get("/stops", this.getStops.bind(this))
        this.app.get("/routes", this.getRoutes.bind(this))
        this.app.get("/shape", this.getShape.bind(this))

        // Start server
        this.app.listen(port)
    }


    private async getStops(req: Request, res: Response): Promise<void>
    {
        let zoom = parseInt(req.query.zoom as string)

        // Stop showing buses when below 16, only show commuter rail below 11
        let types = (zoom >= 16) ? App.ALL : (zoom >= 13) ? App.NO_BUS : VehicleType.COMMUTER_RAIL
        let radius = 1 / (2 ** (zoom - 10))

        // Query stops
        let response = await axios.get(
            App.URL + "/stops" +
            "?filter[latitude]=" + req.query.latitude +
            "&filter[longitude]=" + req.query.longitude +
            "&filter[route_type]=" + types +
            "&filter[radius]=" + radius +
            "&api_key=" + process.env.MBTA_KEY
        )
        
        res.send(response.data.data)
    }

    private async getRoutes(req: Request, res: Response): Promise<void>
    {
        // Query routes
        let response = await axios.get(App.URL + "/routes?filter[stop]=" + req.query.stops + "&api_key=" + process.env.MBTA_KEY)
        res.send(response.data.data)
    }
    
    private async getShape(req: Request, res: Response): Promise<void>
    {
        // Query shape
        let response = await axios.get(App.URL + "/shapes?filter[route]=" + req.query.id + "&page[limit]=1&api_key=" + process.env.MBTA_KEY)
        let shape = response.data.data[0]

        res.send(shape.attributes.polyline)
    }

}

// Initialize environment variables
dotenv.config()
let port = process.env.SERVER_PORT!

new App(port)
console.log(`Server running on port ${port}`)
