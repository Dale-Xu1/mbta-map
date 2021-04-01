import VehicleType from "../stop/VehicleType"

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
        // Query shapes
        let respose = await fetch(`https://api-v3.mbta.com/shapes?filter[route]=${id}&page[limit]=1&api_key=${process.env.REACT_APP_MBTA_KEY}`)
        let json = await respose.json()

        if (this.delete) return

        // Create polyline
        let shape = json.data[0]
        let polyline = shape.attributes.polyline

        let weight = (data.type === VehicleType.BUS) ? 4 : 8
        
        this.polyline = new google.maps.Polyline({
            path: google.maps.geometry.encoding.decodePath(polyline),
            strokeColor: "#" + data.color as string,
            strokeOpacity: 1, strokeWeight: weight,
            map
        })

        // let name = data.short_name as string
        // let description = data.long_name as string
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
