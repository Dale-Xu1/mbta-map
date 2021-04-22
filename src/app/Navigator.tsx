import React from "react"

import Transform from "./transform/Transform"
import Vector from "./transform/Vector"

class Navigator extends React.Component
{

    private canvasRef = React.createRef<HTMLCanvasElement>()

    private canvas!: HTMLCanvasElement
    private c!: CanvasRenderingContext2D

    private request!: number

    private transform!: Transform
    private origin!: Vector


    public componentDidMount(): void
    {
        this.canvas = this.canvasRef.current!
        this.transform = new Transform(this, this.canvas)

        this.c = this.canvas.getContext("2d")!

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

        let position = this.transform.transform(Vector.ZERO)
        this.c.strokeRect(position.x, position.y, this.transform.scale(200), this.transform.scale(100))

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
