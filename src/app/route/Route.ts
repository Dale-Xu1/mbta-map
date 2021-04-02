import axios from "axios"

import VehicleType from "../../server/VehicleType"
import RouteData from "../../server/data/RouteData"

class Route
{

    private static keys: string[] = []
    private static cache = new Map<string, string>()


    private polyline: google.maps.Polyline | null = null
    private delete = false


    public constructor(map: google.maps.Map, data: RouteData)
    {
        this.getShape(map, data)
    }

    private async getShape(map: google.maps.Map, data: RouteData): Promise<void>
    {
        let id = data.id
        let polyline: string

        if (Route.cache.has(id))
        {
            // Reference cached data
            polyline = Route.cache.get(id)!
        }
        else
        {
            // Query shape
            let response = await axios.get("/shape?id=" + data.id)

            polyline = response.data
            this.updateCache(id, polyline)
            
            if (this.delete) return
        }

        let weight = (data.type === VehicleType.BUS) ? 4 : 8
        
        this.polyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(polyline),
            strokeColor: data.color,
            strokeWeight: weight, strokeOpacity: 1,
            map
        })
    }

    private updateCache(id: string, polyline: string): void
    {
        Route.keys.push(id)
        Route.cache.set(id, polyline)

        if (Route.keys.length > 50)
        {
            // Remove data when over a threshold
            let key = Route.keys.shift()!
            Route.cache.delete(key)
        }
    }


    public remove(): void
    {
        if (this.polyline === null)
        {
            // Don't create polyline when request is received
            this.delete = true
            return
        }

        this.polyline.setMap(null)
    }
    
}

export default Route
