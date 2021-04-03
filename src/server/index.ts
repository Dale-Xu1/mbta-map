import express, { Request, Response } from "express"
import dotenv from "dotenv"
import axios from "axios"

import VehicleType from "./VehicleType"
import StopData from "./data/StopData"
import RouteData from "./data/RouteData"
import PredictionData from "./data/PredictionData"

class App
{

    private static URL = "https://api-v3.mbta.com"

    private static ALL = [VehicleType.LIGHT_RAIL, VehicleType.HEAVY_RAIL, VehicleType.COMMUTER_RAIL, VehicleType.BUS, VehicleType.FERRY].join(",")
    private static NO_BUS = [VehicleType.LIGHT_RAIL, VehicleType.HEAVY_RAIL, VehicleType.COMMUTER_RAIL, VehicleType.FERRY].join(",")

    
    private app = express()


    public constructor(port: string)
    {
        this.app.use(express.static("build"))

        this.app.get("/stops", this.getStops.bind(this))
        this.app.get("/routes", this.getRoutes.bind(this))
        this.app.get("/shape", this.getShape.bind(this))
        this.app.get("/predictions", this.getPredictions.bind(this))

        // Start server
        this.app.listen(port)
    }


    private async getStops(req: Request, res: Response): Promise<void>
    {
        let zoom = parseInt(req.query.zoom as string)

        // Stop showing buses when below 16, only show commuter rail below 11
        let types = (zoom >= 16) ? App.ALL : (zoom >= 13) ? App.NO_BUS : VehicleType.COMMUTER_RAIL
        let radius = 1.2 / (2 ** (zoom - 10))

        // Query stops
        let response = await axios.get(
            App.URL + "/stops" +
            "?filter[latitude]=" + req.query.latitude +
            "&filter[longitude]=" + req.query.longitude +
            "&filter[route_type]=" + types +
            "&filter[radius]=" + radius +
            "&include=parent_station&api_key=" + process.env.MBTA_KEY
        )

        // Format data
        let stops: StopData[] = []

        for (let data of response.data.included)
        {
            stops.push(new StopData(data))
        }
        for (let data of response.data.data)
        {
            // Filter children stations
            if (data.relationships.parent_station.data === null)
            {
                stops.push(new StopData(data))
            }
        }
        
        res.send({ stops })
    }

    private async getRoutes(req: Request, res: Response): Promise<void>
    {
        let zoom = parseInt(req.query.zoom as string)
        let types = (zoom >= 16) ? App.ALL : (zoom >= 13) ? App.NO_BUS : VehicleType.COMMUTER_RAIL

        // Query routes
        let response = await axios.get(
            App.URL + "/routes" +
            "?filter[stop]=" + req.query.stops +
            "&filter[type]=" + types +
            "&api_key=" + process.env.MBTA_KEY
        )

        // Format data
        let routes: RouteData[] = []
        for (let data of response.data.data)
        {
            routes.push(new RouteData(data))
        }

        res.send({ routes })
    }
    
    private async getShape(req: Request, res: Response): Promise<void>
    {
        // Query shape
        let response = await axios.get(
            App.URL + "/shapes" +
            "?filter[route]=" + req.query.id +
            "&page[limit]=1&api_key=" + process.env.MBTA_KEY
        )

        let shape = response.data.data[0]
        res.send(shape.attributes.polyline)
    }

    private async getPredictions(req: Request, res: Response): Promise<void>
    {
        // Query predictions
        let response = await axios.get(
            App.URL + "/predictions" +
            "?filter[stop]=" + req.query.stop +
            "&include=route&api_key=" + process.env.MBTA_KEY
        )

        // Format data
        let predictions = new Map<string, PredictionData>()
        for (let data of response.data.included)
        {
            predictions.set(data.id, new PredictionData(data))
        }

        for (let data of response.data.data)
        {
            // Get prediction route
            let id = data.relationships.route.data.id
            let route = predictions.get(id)!

            route.add(data.attributes)
        }

        res.send({ predictions: Array.from(predictions.values()) })
    }

}

// Initialize environment variables
dotenv.config()
let port = process.env.SERVER_PORT!

new App(port)
console.log(`Server running on port ${port}`)
