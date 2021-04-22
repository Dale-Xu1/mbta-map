import React from "react"

import Transform from "./transform/Transform"
import Vector from "./transform/Vector"

class Navigator extends React.Component
{

    private static SCALE = 256

    private static POSITION = new Vector(42.3528392, -71.0706818)
    private static ZOOM = 16


    private canvasRef = React.createRef<HTMLCanvasElement>()

    private canvas!: HTMLCanvasElement
    private c!: CanvasRenderingContext2D

    private request!: number

    private transform!: Transform
    private origin!: Vector


    public componentDidMount(): void
    {
        this.canvas = this.canvasRef.current!
        this.c = this.canvas.getContext("2d")!
        
        // Initialize default transformations
        let position = this.project(Navigator.POSITION)
        this.transform = new Transform(this, this.canvas)

        this.transform.setTranslation(position)
        this.transform.setZoom(Navigator.ZOOM)

        // Size canvas to window
        this.resizeCanvas = this.resizeCanvas.bind(this)
        this.resizeCanvas()

        window.addEventListener("resize", this.resizeCanvas)
        this.update()
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


    public project(vector: Vector): Vector // Expects vector to represent latitude and longitude
    {
        let x = vector.y * Navigator.SCALE / 360

        // I have no idea what this means
        let sin = Math.sin(vector.x * Math.PI / 180)
        let y = -Math.log((1 + sin) / (1 - sin)) * Navigator.SCALE / (4 * Math.PI)

        return new Vector(x, y)
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

        this.c.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.c.save()
        this.c.translate(this.origin.x, this.origin.y)

        // Test points
        let world = this.project(Navigator.POSITION)
        let position = this.transform.transform(world)
        this.c.strokeRect(position.x, position.y, 10, 10)
        
        world = this.project(Navigator.POSITION.add(new Vector(0.001, 0.001)))
        position = this.transform.transform(world)
        this.c.strokeRect(position.x, position.y, 10, 10)

        this.c.restore()
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
