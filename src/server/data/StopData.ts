import VehicleType from "../VehicleType"

class StopData
{

    public id: string

    public name: string
    public description: string

    public longitude: number
    public latitude: number

    public type: VehicleType


    public constructor(data: any)
    {
        let attributes = data.attributes
        this.id = data.id

        // Remove "Opp " from beginning of it's there
        let name = attributes.name
        if (name.startsWith("Opp ")) name = name.slice(4)

        let parts = name.split(/( @ | opp )/)
        if (parts.length > 1)
        {
            this.name = parts[2]
            this.description = parts[0]
        }
        else
        {
            this.name = parts[0]
            this.description = ""
        }


        this.latitude = attributes.latitude
        this.longitude = attributes.longitude

        this.type = attributes.vehicle_type
    }

}

export default StopData
