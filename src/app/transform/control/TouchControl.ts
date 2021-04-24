import Transform from "../Transform"
import Navigator from "../../Navigator"
import Vector from "../Vector"

class TouchControl
{

    private initial!: Vector
    private initialTranslation!: Vector


    public constructor(private transform: Transform, private element: HTMLElement)
    {
        this.onTouchStart = this.onTouchStart.bind(this)
        this.onTouchEnd = this.onTouchEnd.bind(this)
        this.onTouchMove = this.onTouchMove.bind(this)

        element.addEventListener("touchstart", this.onTouchStart)
        element.addEventListener("touchend", this.onTouchEnd)
        element.addEventListener("touchmove", this.onTouchMove)
    }

    public unmount(): void
    {
        let element = this.element

        element.removeEventListener("touchstart", this.onTouchStart)
        element.removeEventListener("touchend", this.onTouchEnd)
        element.removeEventListener("touchmove", this.onTouchMove)
    }


    private onTouchStart(e: TouchEvent): void
    {
        // Save initial mouse location and translation
        this.initial = this.averagePosition(e)
        this.initialTranslation = this.transform.getTranslation()
    }

    private onTouchEnd(): void
    {
        this.transform.stopTranslation()
    }

    private onTouchMove(e: TouchEvent): void
    {
        e.preventDefault()

        // Calculate new translation vector
        let position = this.averagePosition(e)
        let translation = this.initial.sub(position).div(this.transform.getScale())

        this.transform.setTranslation(this.initialTranslation.add(translation))
    }


    private averagePosition(e: TouchEvent): Vector
    {
        let average = Vector.ZERO
        for (let touch of e.touches)
        {
            average = average.add(new Vector(touch.clientX, touch.clientY))
        }

        return average.div(e.touches.length)
    }

}

export default TouchControl
