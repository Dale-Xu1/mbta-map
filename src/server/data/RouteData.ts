import VehicleType from "../VehicleType"

class RouteData
{

    public id: string

    public color: string
    public type: VehicleType


    public constructor(data: any)
    {
        let attributes = data.attributes
        this.id = data.id

        this.color = "#" + attributes.color
        this.type = attributes.type
    }

}

export default RouteData
