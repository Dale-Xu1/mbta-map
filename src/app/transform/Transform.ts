import Vector from "./Vector"
import Navigator from "../Navigator"
import MouseControl from "./control/MouseControl"
import TouchControl from "./control/TouchControl"

class Transform
{

    private static MARGIN = 20
    private static DRAG = 0.005


    private mouse: MouseControl
    private touch: TouchControl
    
    private velocity = Vector.ZERO
    private initialize = false

    private scale: number


    public constructor(
        private navigator: Navigator,
        private translation: Vector,
        private zoom: number,
        element: HTMLElement
    ) {
        this.mouse = new MouseControl(navigator, this, element)
        this.touch = new TouchControl(this, element)

        this.scale = 2 ** zoom
    }

    public unmount(): void
    {
        this.mouse.unmount()
        this.touch.unmount()
    }


    public transform(vector: Vector): Vector
    {
        return vector.sub(this.translation).mult(this.scale)
    }

    public getTranslation(): Vector
    {
        return this.translation
    }

    private previous = this.translation

    public setTranslation(translation: Vector): void
    {
        this.previous = this.translation
        this.translation = translation

        this.velocity = Vector.ZERO
    }

    public stopTranslation(): void
    {
        this.initialize = true
    }

    public isVisible(vector: Vector): boolean
    {
        let origin = this.navigator.getOrigin()
        
        let x = (vector.x > -origin.x - Transform.MARGIN) && (vector.x < origin.x + Transform.MARGIN)
        let y = (vector.y > -origin.y - Transform.MARGIN) && (vector.y < origin.y + Transform.MARGIN)
        
        return x && y
    }


    public getZoom(): number
    {
        return this.zoom
    }

    public getScale(): number
    {
        return this.scale
    }

    public setZoom(zoom: number): void
    {
        // Recalculate scale
        this.zoom = zoom
        this.scale = 2 ** zoom

        this.onZoom()
    }

    
    public update(delta: number): void
    {
        if (this.initialize)
        {
            // Calculate velocity
            this.velocity = this.translation.sub(this.previous).div(delta)
            this.initialize = false
        }

        // Apply left-over velocity from translation
        this.velocity = this.velocity.mult(Transform.DRAG ** delta)
        this.translation = this.translation.add(this.velocity.mult(delta))
        
        this.onMove()
    }


    private previousTranslation = this.translation

    private onMove(): void
    {
        let distance = this.translation.sub(this.previousTranslation).magSq()
        let threshold = 400 / this.scale
        
        // Refresh once user has moved far enough
        if (distance > threshold ** 2)
        {
            this.previousTranslation = this.translation
            this.refresh()
        }
    }

    private previousZoom = this.zoom

    private onZoom(): void
    {
        // Test for when zoom level changes
        let zoom = Math.floor(this.zoom)
        if (zoom !== this.previousZoom)
        {
            this.previousZoom = zoom
            this.refresh()
        }
    }

    private refresh(): void
    {
        let position = Navigator.toCoordinates(this.translation)
        this.navigator.refresh(position)
    }

}

export default Transform
