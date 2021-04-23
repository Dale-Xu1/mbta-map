import axios from "axios"

import VehicleType from "../../server/VehicleType"
import RouteData from "../../server/data/RouteData"
import Polyline from "./Polyline"
import Transform from "../transform/Transform"
import Stop from "../stop/Stop"

class Route
{

    private static keys: string[] = []
    private static cache = new Map<string, Polyline[]>()

    
    private color!: string
    private type!: VehicleType
    

    private static updateCache(id: string, polylines: Polyline[]): void
    {
        Route.keys.push(id)
        Route.cache.set(id, polylines)

        if (Route.keys.length > 50)
        {
            // Remove data when over a threshold
            let key = Route.keys.shift()!
            Route.cache.delete(key)
        }
    }


    private polylines: Polyline[] = []


    public constructor(private transform: Transform, data: RouteData)
    {
        this.getShape(transform, data)
    }

    private async getShape(transform: Transform, data: RouteData): Promise<void>
    {
        let id = data.id

        this.color = data.color
        this.type = data.type

        if (Route.cache.has(id))
        {
            // Reference cached data
            this.polylines = Route.cache.get(id)!
        }
        else
        {
            // Query shapes
            let response = await axios.get("/shapes?id=" + data.id)
            for (let shape of response.data.shapes)
            {
                // Convert shapes to coordinates
                this.polylines.push(new Polyline(transform, shape))
            }

            Route.updateCache(id, this.polylines)
        }
    }


    public render(c: CanvasRenderingContext2D): void
    {
        let zoom = this.transform.getZoom()
        if (zoom < Stop.BUS_ZOOM && this.type === VehicleType.BUS) return

        c.strokeStyle = this.color
        
        c.lineWidth = this.type === VehicleType.BUS ? 3 : 6
        c.lineCap = "round"

        for (let polyline of this.polylines)
        {
            polyline.render(c)
        }
    }
    
}

export default Route
