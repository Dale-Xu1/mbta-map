import axios from "axios"

import VehicleType from "../../server/VehicleType"
import RouteData from "../../server/data/RouteData"
import Navigator from "../Navigator"

class Route
{

    private static keys: string[] = []
    private static cache = new Map<string, string[]>() // TODO: Cache actual coordinates


    public constructor(private navigator: Navigator, data: RouteData)
    {
        this.getShape(data)
    }

    private async getShape(data: RouteData): Promise<void>
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
        }

        // Create polylines
        // let weight = (data.type === VehicleType.BUS) ? 3 : 6
        
        // for (let shape of shapes)
        // {
            // let polyline = new google.maps.Polyline({
            //     path: google.maps.geometry.encoding.decodePath(shape),
            //     strokeColor: data.color,
            //     strokeWeight: weight, strokeOpacity: 1,
            //     map
            // })

            // this.polylines.push(polyline)
        // }
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
    
}

export default Route
