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

    private static POSITION = new LatLong(42.3528392, -71.0706818)
    private static ZOOM = 16


    private canvasRef = React.createRef<HTMLCanvasElement>()

    private canvas!: HTMLCanvasElement
    private c!: CanvasRenderingContext2D

    private request!: number

    private transform!: Transform
    private stops = new StopManager(this)

    private origin!: Vector


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
        navigator.geolocation.getCurrentPosition(this.initializeMap.bind(this), this.initializeDefault.bind(this))
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
        let translation = Transform.toWorld(position)

        this.transform.setTranslation(translation)
        this.transform.setZoom(Navigator.ZOOM)

        this.stops.refresh(position)
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


    private update(): void
    {
        this.request = window.requestAnimationFrame(this.update.bind(this))

        let c = this.c
        c.clearRect(0, 0, this.canvas.width, this.canvas.height)
        c.save()
        c.translate(this.origin.x, this.origin.y)

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
