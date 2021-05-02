import VehicleType from "../VehicleType"
import TimeData from "./TimeData"

class PredictionData
{

    public name: string

    public color: string
    public directions: string[]
    
    public inbound: TimeData[] = []
    public outbound: TimeData[] = []


    public constructor(data: any)
    {
        let attributes = data.attributes

        if (attributes.type === VehicleType.BUS) this.name = attributes.short_name
        else this.name = this.name = attributes.long_name

        this.name = this.name.replace(" Line", "")

        this.color = "#" + attributes.color
        this.directions = attributes.direction_destinations
    }


    public add(data: any): void
    {
        // Remove predictions without times
        let time = new TimeData(data)
        if (time.arrival === null && time.departure === null) return

        if (data.direction_id === 0) this.outbound.push(time)
        else this.inbound.push(time)
    }

}

export default PredictionData
