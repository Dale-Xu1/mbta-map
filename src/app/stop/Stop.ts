import Navigator from "../Navigator"
import StopData from "../../server/data/StopData"
import VehicleType from "../../server/VehicleType"
import LatLong from "../transform/LatLong"
import Vector from "../transform/Vector"
import Transform from "../transform/Transform"

class Stop
{

    private id: string

    private name: string
    private description: string

    private transform: Transform

    private position: Vector
    private isBus: boolean


    public constructor(navigator: Navigator, data: StopData)
    {
        this.id = data.id

        this.name = data.name
        this.description = data.description

        this.transform = navigator.getTransform()

        let position = new LatLong(data.latitude, data.longitude)
        this.position = Transform.toWorld(position)

        this.isBus = (data.type === VehicleType.BUS)
    }


    public getId(): string
    {
        return this.id
    }

    public getName(): string
    {
        return this.name
    }

    public getDescription(): string
    {
        return this.description
    }


    public renderBase(c: CanvasRenderingContext2D): void
    {
        let position = this.transform.transform(this.position)

        c.beginPath()
        c.arc(position.x, position.y, this.isBus ? 5 : 8, 0, 2 * Math.PI)

        c.fillStyle = "black"
        c.fill()
    }

    public render(c: CanvasRenderingContext2D): void
    {
        let position = this.transform.transform(this.position)
        
        c.beginPath()
        c.arc(position.x, position.y, this.isBus ? 3 : 5, 0, 2 * Math.PI)
        
        c.fillStyle = "white"
        c.fill()
    }

}

export default Stop
