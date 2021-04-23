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

    private static SCALE = 0.0016


    private translation = Vector.ZERO

    private zoom = 0
    private scale = 1

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

            let translation = this.initial.sub(current).div(this.scale)
            this.translation = this.initialTranslation.add(translation)
        }
    }
    
    private onWheel(e: WheelEvent): void
    {
        let delta = e.deltaY * Transform.SCALE

        // Correct for translation so zoom happens around the cursor
        let mouse = new Vector(e.offsetX, e.offsetY).sub(this.navigator.getOrigin())
        let correction = mouse.mult((2 ** delta - 1) / this.scale) // Who thought algebra was actually useful?

        this.translation = this.translation.sub(correction)
        this.setZoom(this.zoom - delta)
    }


    public transform(vector: Vector): Vector
    {
        return vector.sub(this.translation).mult(this.scale)
    }

    public setTranslation(translation: Vector): void
    {
        this.translation = translation
    }


    public getZoom(): number
    {
        return this.zoom
    }

    public setZoom(zoom: number): void
    {
        this.zoom = zoom
        this.scale = 2 ** zoom
    }

}

export default Transform
