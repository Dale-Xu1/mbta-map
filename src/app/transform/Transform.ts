import Vector from "./Vector"
import Navigator from "../Navigator"

enum Button
{

    NONE,

    LEFT,
    RIGHT

}

class Transform
{

    private translation = Vector.ZERO
    private zoom = 0

    private isMoving = false

    private initial!: Vector
    private initialTranslation!: Vector


    public constructor(private navigator: Navigator, element: HTMLElement)
    {
        element.addEventListener("mousedown", this.onMouseDown.bind(this))
        element.addEventListener("mouseup", this.onMouseUp.bind(this))
        element.addEventListener("mousemove", this.onMouseMove.bind(this))
        element.addEventListener("wheel", this.onWheel.bind(this))
    }


    private onMouseDown(e: MouseEvent): void
    {
        // If left-mouse button is pressed
        if (e.buttons === Button.LEFT)
        {
            this.isMoving = true

            // Save initial mouse location and translation
            this.initial = new Vector(e.x, e.y)
            this.initialTranslation = this.translation
        }
    }

    private onMouseUp(): void
    {
        this.isMoving = false
    }
    
    private onMouseMove(e: MouseEvent): void
    {
        if (this.isMoving)
        {
            // Calculate new translation vector
            let current = new Vector(e.x, e.y)
            this.translation = this.initialTranslation.add(current.sub(this.initial))
        }
    }
    
    private onWheel(e: WheelEvent): void
    {
        let delta = e.deltaY * 0.0016

        // Correct for translation so zoom happens around the cursor
        let mouse = new Vector(e.offsetX, e.offsetY).sub(this.navigator.getOrigin())
        let correction = mouse.sub(this.translation).mult(1 - 1 / (2 ** delta)) // Who thought algebra was actually useful?

        this.translation = this.translation.add(correction)
        this.zoom -= delta
    }


    public transform(vector: Vector): Vector
    {
        let scale = 2 ** this.zoom
        return vector.mult(scale).add(this.translation)
    }

    public scale(value: number): number
    {
        let scale = 2 ** this.zoom
        return value * scale
    }

}

export default Transform
