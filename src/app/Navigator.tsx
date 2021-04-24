import React from "react"
import App from "./App"

import StopManager from "./stop/StopManager"
import LatLong from "./transform/LatLong"
import Transform from "./transform/Transform"
import Vector from "./transform/Vector"

interface Props
{

    app: App

}

class Navigator extends React.Component<Props>
{

    private static SCALE = 256

    private static POSITION = new LatLong(42.356692, -71.0598287)
    private static ZOOM = 16
    

    public static toWorld(position: LatLong): Vector
    {
        let x = position.longitude * Navigator.SCALE / 360

        // I have no idea what this means
        let tan = Math.tan(Math.PI / 4 + (position.latitude * Math.PI / 360))
        let y = -Math.log(tan) * Navigator.SCALE / (2 * Math.PI)

        return new Vector(x, y)
    }

    public static toCoordinates(vector: Vector): LatLong
    {
        let longitude = vector.x / Navigator.SCALE * 360

        // Literally the opposite of the other function
        let exp = Math.exp(-vector.y / Navigator.SCALE * 2 * Math.PI)
        let latitude = (Math.atan(exp) - (Math.PI / 4)) / Math.PI * 360

        return new LatLong(latitude, longitude)
    }


    private canvasRef = React.createRef<HTMLCanvasElement>()

    private canvas!: HTMLCanvasElement
    private c!: CanvasRenderingContext2D

    private request!: number

    private transform!: Transform
    private stops!: StopManager

    private origin!: Vector


    public componentDidMount(): void
    {
        this.canvas = this.canvasRef.current!
        this.c = this.canvas.getContext("2d")!

        // Size canvas to window
        this.resizeCanvas = this.resizeCanvas.bind(this)
        this.resizeCanvas()

        window.addEventListener("resize", this.resizeCanvas)
        
        // Get current location of user
        navigator.geolocation.getCurrentPosition(this.initializeMap.bind(this), this.initializeDefault.bind(this))
    }

    public componentWillUnmount(): void
    {
        // Unsubscribe event handlers
        window.removeEventListener("resize", this.resizeCanvas)
        window.cancelAnimationFrame(this.request)

        this.transform.unmount()
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
        let coordinates = result.coords
        let position = new LatLong(coordinates.latitude, coordinates.longitude)
        
        this.initialize(position)
    }

    private initializeDefault(): void
    {
        this.initialize(Navigator.POSITION)
    }

    private initialize(position: LatLong): void
    {
        // Set transformation and fetch stops
        let translation = Navigator.toWorld(position)

        this.transform = new Transform(this, translation, Navigator.ZOOM, this.canvas)
        this.stops = new StopManager(this, this.canvas)

        this.stops.refresh(position)

        this.previous = Date.now()
        this.update()
    }

    
    private timeout: NodeJS.Timeout | null = null

    public refresh(position: LatLong): void
    {
        // Cancel refresh from calling if another was requested
        if (this.timeout !== null)
        {
            clearTimeout(this.timeout)
        }

        // Wait before refreshing
        this.timeout = setTimeout(() =>
        {
            this.timeout = null
            this.stops.refresh(position)
        }, 300)
    }


    public getTransform(): Transform
    {
        return this.transform
    }

    public getOrigin(): Vector
    {
        return this.origin
    }


    private previous!: number

    private update(): void
    {
        this.request = window.requestAnimationFrame(this.update.bind(this))

        // Accumulate time
        let current = Date.now()
        let elapsed = current - this.previous

        this.previous = current

        // Clear and center canvas
        let c = this.c
        c.clearRect(0, 0, this.canvas.width, this.canvas.height)
        c.save()
        c.translate(this.origin.x, this.origin.y)

        this.transform.update(elapsed / 1000)
        this.stops.render(c)

        c.restore()
    }

    public render(): React.ReactElement
    {
        return (
            <div className="navigator">
                <canvas className="map" ref={this.canvasRef}></canvas>
            </div>
        )
    }

}

export default Navigator
