import React from "react"

import StopManager from "./stop/StopManager"
import LatLong from "./transform/LatLong"
import Transform from "./transform/Transform"
import Vector from "./transform/Vector"

class Navigator extends React.Component
{

    private static SCALE = 256

    private static POSITION = new LatLong(42.3528392, -71.0706818)
    private static ZOOM = 16


    private canvasRef = React.createRef<HTMLCanvasElement>()

    private canvas!: HTMLCanvasElement
    private c!: CanvasRenderingContext2D

    private request!: number

    private transform!: Transform
    private position = Navigator.POSITION
    private origin!: Vector

    private stops = new StopManager(this)


    public componentDidMount(): void
    {
        this.canvas = this.canvasRef.current!
        this.c = this.canvas.getContext("2d")!
        
        this.transform = new Transform(this, this.canvas)

        // Size canvas to window
        this.resizeCanvas = this.resizeCanvas.bind(this)
        this.resizeCanvas()

        window.addEventListener("resize", this.resizeCanvas)
        this.update()
        
        // Get current location of user
        navigator.geolocation.getCurrentPosition(this.initializeMap.bind(this), this.initialize.bind(this))
    }

    public componentWillUnmount(): void
    {
        // Unsubscribe event handlers
        window.removeEventListener("resize", this.resizeCanvas)
        window.cancelAnimationFrame(this.request)
    }

    private resizeCanvas(): void
    {
        let width = this.canvas.width = this.canvas.clientWidth
        let height = this.canvas.height = this.canvas.clientHeight

        this.origin = new Vector(width / 2, height / 2)
    }

    private initializeMap(result: GeolocationPosition): void
    {
        // Center map on position
        let position = result.coords
        this.position = new LatLong(position.latitude, position.longitude)
        
        this.initialize()
    }

    private initialize(): void
    {
        // Set transformation and fetch stops
        let translation = this.toWorld(this.position)

        this.transform.setTranslation(translation)
        this.transform.setZoom(Navigator.ZOOM)

        this.stops.refresh(this.position)
    }


    public toWorld(position: LatLong): Vector
    {
        let x = position.longitude * Navigator.SCALE / 360

        // I have no idea what this means
        let tan = Math.tan((Math.PI / 4) + (position.latitude * Math.PI / 360))
        let y = -Math.log(tan) * Navigator.SCALE / (2 * Math.PI)

        return new Vector(x, y)
    }

    public toCoordinates(vector: Vector): LatLong
    {
        let longitude = vector.x / Navigator.SCALE * 360

        // Literally the opposite of the other function
        let exp = Math.exp(-vector.y / Navigator.SCALE * (2 * Math.PI))
        let latitude = (Math.atan(exp) - (Math.PI / 4)) / Math.PI * 360

        return new LatLong(latitude, longitude)
    }


    public getTransform(): Transform
    {
        return this.transform
    }

    public getOrigin(): Vector
    {
        return this.origin
    }


    private update(): void
    {
        this.request = window.requestAnimationFrame(this.update.bind(this))

        let c = this.c
        c.clearRect(0, 0, this.canvas.width, this.canvas.height)
        c.save()
        c.translate(this.origin.x, this.origin.y)

        // // Test points
        // let world = this.toWorld(Navigator.POSITION)
        // let position = this.transform.transform(world)
        // c.strokeRect(position.x, position.y, 10, 10)
        
        // world = this.toWorld(new LatLong(Navigator.POSITION.latitude + 0.001, Navigator.POSITION.longitude + 0.001))
        // position = this.transform.transform(world)
        // c.strokeRect(position.x, position.y, 10, 10)

        this.stops.render(c)

        c.restore()
    }

    public render(): React.ReactElement
    {
        return (
            <div>
                <canvas className="map" ref={this.canvasRef}></canvas>
            </div>
        )
    }

}

export default Navigator
