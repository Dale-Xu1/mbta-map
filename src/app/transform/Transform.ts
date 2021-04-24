import Vector from "./Vector"
import Navigator from "../Navigator"
import MouseControl from "./control/MouseControl"
import TouchControl from "./control/TouchControl"

class Transform
{

    private static MARGIN = 20

    private static INITIAL = 0.8
    private static DRAG = 0.93


    private mouse: MouseControl
    private touch: TouchControl
    
    private velocity = Vector.ZERO
    private isMoving = false

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

    public setTranslation(translation: Vector): void
    {
        // Calculate velocity
        this.velocity = translation.sub(this.translation).mult(Transform.INITIAL)
        this.isMoving = true

        this.translation = translation
    }

    public stopTranslation(): void
    {
        this.isMoving = false
    }

    public isVisible(vector: Vector): boolean
    {
        let origin = this.navigator.getOrigin()
        
        let x = vector.x > -origin.x && vector.x < origin.x
        let y = vector.y > -origin.y && vector.y < origin.y
        
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


    public update(): void
    {
        if (!this.isMoving)
        {
            // Apply left-over velocity from translation
            this.velocity = this.velocity.mult(Transform.DRAG)
            this.translation = this.translation.add(this.velocity)
        }
        
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
