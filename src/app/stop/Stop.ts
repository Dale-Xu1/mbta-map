import StopData from "../../server/data/StopData"
import VehicleType from "../../server/VehicleType"
import LatLong from "../transform/LatLong"
import Vector from "../transform/Vector"
import Transform from "../transform/Transform"
import Navigator from "../Navigator"

class Stop
{

    public static BUS_ZOOM = 16
    private static RADIUS = 10


    private id: string

    private name: string
    private description: string

    private type: VehicleType

    private position: Vector


    public constructor(private transform: Transform, data: StopData)
    {
        this.id = data.id

        this.name = data.name
        this.description = data.description

        this.type = data.type

        let position = new LatLong(data.latitude, data.longitude)
        this.position = Navigator.toWorld(position)
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

    public isSelected(vector: Vector): boolean
    {
        let position = this.transform.transform(this.position)
        return position.sub(vector).magSq() < Stop.RADIUS ** 2
    }


    public renderBase(c: CanvasRenderingContext2D): void
    {
        c.fillStyle = "black"
        this.drawCircle(c, this.type === VehicleType.BUS ? 5 : 8)
    }

    public render(c: CanvasRenderingContext2D): void
    {
        c.fillStyle = "white"
        this.drawCircle(c, this.type === VehicleType.BUS ? 3 : 5)
    }

    private drawCircle(c: CanvasRenderingContext2D, radius: number): void
    {
        let zoom = this.transform.getZoom()
        if (zoom < Stop.BUS_ZOOM && this.type === VehicleType.BUS) return

        let position = this.transform.transform(this.position)
        if (!this.transform.isVisible(position)) return
        
        c.beginPath()
        c.arc(position.x, position.y, radius, 0, 2 * Math.PI)
        c.fill()
    }

}

export default Stop
