import axios from "axios"

import VehicleType from "../../server/VehicleType"
import RouteData from "../../server/data/RouteData"

class Route
{

    private static keys: string[] = []
    private static cache = new Map<string, string[]>()


    private polylines: google.maps.Polyline[] = []
    private delete = false


    public constructor(map: google.maps.Map, data: RouteData)
    {
        this.getShape(map, data)
    }

    private async getShape(map: google.maps.Map, data: RouteData): Promise<void>
    {
        let id = data.id
        let shapes: string[]

        if (Route.cache.has(id))
        {
            // Reference cached data
            shapes = Route.cache.get(id)!
        }
        else
        {
            // Query shapes
            let response = await axios.get("/shapes?id=" + data.id)

            shapes = response.data.shapes
            this.updateCache(id, shapes)
            
            if (this.delete) return
        }

        // Create polylines
        let weight = (data.type === VehicleType.BUS) ? 3 : 6
        
        for (let shape of shapes)
        {
            let polyline = new google.maps.Polyline({
                path: google.maps.geometry.encoding.decodePath(shape),
                strokeColor: data.color,
                strokeWeight: weight, strokeOpacity: 1,
                map
            })

            this.polylines.push(polyline)
        }
    }

    private updateCache(id: string, shapes: string[]): void
    {
        Route.keys.push(id)
        Route.cache.set(id, shapes)

        if (Route.keys.length > 50)
        {
            // Remove data when over a threshold
            let key = Route.keys.shift()!
            Route.cache.delete(key)
        }
    }


    public remove(): void
    {
        if (this.polylines.length === 0)
        {
            // Don't create polyline when request is received
            this.delete = true
            return
        }

        for (let polyline of this.polylines)
        {
            polyline.setMap(null)
        }
    }
    
}

export default Route
