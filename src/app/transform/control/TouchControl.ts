import Transform from "../Transform"
import Vector from "../Vector"
import Navigator from "../../Navigator"

class TouchControl
{

    private initial!: Vector
    private initialTranslation!: Vector

    private initialDist!: number

    private initialZoom!: number
    private initialScale!: number


    public constructor(private navigator: Navigator, private transform: Transform, private element: HTMLElement)
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
        let translation = this.transform.getTranslation()
        
        // Save initial mouse location and translation
        this.initial = this.averagePosition(e)

        this.initialTranslation = translation
        this.transform.setTranslation(translation) // Update previous translation
        
        if (e.touches.length === 2)
        {
            // Initialize zoom information
            this.initialDist = this.distance(e);

            this.initialZoom = this.transform.getZoom()
            this.initialScale = this.transform.getScale()
        }
    }

    private onTouchEnd(e: TouchEvent): void
    {
        if (e.touches.length === 0)
        {
            this.transform.stopTranslation()
            return
        }

        // Reset initial touch point
        this.onTouchStart(e)
    }

    private onTouchMove(e: TouchEvent): void
    {
        e.preventDefault()

        // Calculate new translation vector
        let position = this.averagePosition(e)
        let translation = this.initial.sub(position).div(this.initialScale)
        
        if (e.touches.length === 2)
        {
            // Calculate change in zoom based on how the distance scales
            let scale = Math.sqrt(this.distance(e) / this.initialDist)
            let zoom = Math.log2(scale)

            // Correct for shift that occurs due to zoom
            let origin = position.sub(this.navigator.getOrigin())
            let correction = origin.div(this.initialScale).mult(1 - (1 / scale))

            translation = translation.add(correction)
            this.transform.setZoom(this.initialZoom + zoom)
        }

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

    private distance(e: TouchEvent): number
    {
        let a = new Vector(e.touches[0].clientX, e.touches[0].clientY)
        let b = new Vector(e.touches[1].clientX, e.touches[1].clientY)

        return a.sub(b).magSq()
    }

}

export default TouchControl
