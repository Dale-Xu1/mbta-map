import Vector from "../Vector"
import Button from "./Button"
import Navigator from "../../Navigator"
import Transform from "../Transform"

class MouseControl
{

    private static SPEED = 0.0016
    

    private initial!: Vector
    private initialTranslation!: Vector

    
    public constructor(private navigator: Navigator, private transform: Transform, private element: HTMLElement)
    {
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onWheel = this.onWheel.bind(this)

        element.addEventListener("mousedown", this.onMouseDown)
        element.addEventListener("mouseup", this.onMouseUp)
        element.addEventListener("mousemove", this.onMouseMove)
        element.addEventListener("wheel", this.onWheel)
    }

    public unmount(): void
    {
        let element = this.element

        element.removeEventListener("mousedown", this.onMouseDown)
        element.removeEventListener("mouseup", this.onMouseUp)
        element.removeEventListener("mousemove", this.onMouseMove)
        element.removeEventListener("wheel", this.onWheel)
    }


    private onMouseDown(e: MouseEvent): void
    {
        if (e.buttons === Button.LEFT)
        {
            let translation = this.transform.getTranslation()
            
            // Save initial mouse location and translation
            this.initial = new Vector(e.x, e.y)

            this.initialTranslation = translation
            this.transform.setTranslation(translation) // Update previous translation
        }
    }

    private onMouseUp(): void
    {
        this.element.style.cursor = "default"
        this.transform.stopTranslation()
    }
    
    private onMouseMove(e: MouseEvent): void
    {
        if (e.buttons === Button.LEFT)
        {
            this.element.style.cursor = "all-scroll"
            
            // Calculate new translation vector
            let translation = this.initial.sub(new Vector(e.x, e.y)).div(this.transform.getScale())
            this.transform.setTranslation(this.initialTranslation.add(translation))
        }
    }
    
    private onWheel(e: WheelEvent): void
    {
        let delta = e.deltaY * MouseControl.SPEED

        // Correct for translation so zoom happens around the cursor
        let mouse = new Vector(e.offsetX, e.offsetY).sub(this.navigator.getOrigin())
        let correction = mouse.div(this.transform.getScale()).mult(2 ** delta - 1) // Who would have thought algebra was actually useful?

        let translation = this.transform.getTranslation()
        let zoom = this.transform.getZoom()

        this.transform.setTranslation(translation.sub(correction))
        this.transform.setZoom(zoom - delta)
    }

}

export default MouseControl
