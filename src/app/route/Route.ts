import axios from "axios"

import VehicleType from "../../server/VehicleType"

class Route
{

    private polyline: google.maps.Polyline | null = null
    private delete = false


    public constructor(map: google.maps.Map, id: string, data: any)
    {
        this.getShape(map, id, data)
    }

    private async getShape(map: google.maps.Map, id: string, data: any): Promise<void>
    {
        // Query shape
        let response = await axios.get("/shape?id=" + id)
        if (this.delete) return

        let weight = (data.type === VehicleType.BUS) ? 4 : 8
        
        this.polyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(response.data),
            strokeColor: "#" + data.color as string,
            strokeOpacity: 1, strokeWeight: weight,
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
