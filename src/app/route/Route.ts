import axios from "axios"

import VehicleType from "../../server/VehicleType"
import RouteData from "../../server/data/RouteData"

class Route
{

    private polyline: google.maps.Polyline | null = null
    private delete = false


    public constructor(map: google.maps.Map, data: RouteData)
    {
        this.getShape(map, data)
    }

    private async getShape(map: google.maps.Map, data: RouteData): Promise<void>
    {
        // Query shape
        let response = await axios.get("/shape?id=" + data.id)
        if (this.delete) return

        let weight = (data.type === VehicleType.BUS) ? 4 : 8
        
        this.polyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(response.data),
            strokeColor: data.color,
            strokeWeight: weight, strokeOpacity: 1,
            map
        })
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
