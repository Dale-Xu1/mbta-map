import LatLong from "../transform/LatLong"
import Transform from "../transform/Transform"
import Vector from "../transform/Vector"

class Polyline
{

    private static index: number
    
    private static decode(encoded: string): LatLong[]
    {
        let coordinates: LatLong[] = []

        Polyline.index = 0
        let latitude = 0, longitude = 0

        while (Polyline.index < encoded.length)
        {
            latitude += Polyline.getDelta(encoded)
            longitude += Polyline.getDelta(encoded)

            coordinates.push(new LatLong(latitude / 1e5, longitude / 1e5))
        }

        return coordinates
    }

    private static getDelta(encoded: string): number
    {
        let b
        let shift = 0, result = 0

        do
        {
            b = encoded.charCodeAt(Polyline.index++) - 63
            result |= (b & 0x1f) << shift
            shift += 5
        }
        while (b >= 0x20)

        return (result & 1) !== 0 ? ~(result >> 1) : result >> 1
    }


    private points: Vector[] = []


    public constructor(private transform: Transform, shape: string)
    {
        let coordinates = Polyline.decode(shape)
        for (let position of coordinates)
        {
            this.points.push(Transform.toWorld(position))
        }
    }


    public render(c: CanvasRenderingContext2D)
    {
        let previous = this.transform.transform(this.points[0])
        for (let i = 1; i < this.points.length; i++)
        {
            let position = this.transform.transform(this.points[i])

            if (this.transform.isVisible(previous) || this.transform.isVisible(position))
            {
                c.beginPath()
                c.moveTo(previous.x, previous.y)
                c.lineTo(position.x, position.y)
                c.stroke()
            }

            previous = position
        }
    }

}

export default Polyline
