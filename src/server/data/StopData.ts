import VehicleType from "../VehicleType"

class StopData
{

    public id: string

    public longitude: number
    public latitude: number

    public type: VehicleType


    public constructor(data: any)
    {
        let attributes = data.attributes
        this.id = data.id

        this.latitude = attributes.latitude
        this.longitude = attributes.longitude

        this.type = attributes.vehicle_type
    }

}

export default StopData