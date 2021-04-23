import Vector from "./Vector"
import Navigator from "../Navigator"
import Button from "./Button"

class Transform
{

    private static SPEED = 0.0016


    private translation = Vector.ZERO

    private zoom = 0
    private scale = 1

    private initial!: Vector
    private initialTranslation!: Vector


    public constructor(private navigator: Navigator, private element: HTMLElement)
    {
        element.addEventListener("mousedown", this.onMouseDown.bind(this))
        element.addEventListener("mouseup", this.stopTranslation.bind(this))
        element.addEventListener("mousemove", this.onMouseMove.bind(this))
        element.addEventListener("wheel", this.onWheel.bind(this))
        
        element.addEventListener("touchstart", this.onTouchStart.bind(this))
        element.addEventListener("touchmove", this.onTouchMove.bind(this))
    }


    private onMouseDown(e: MouseEvent): void
    {
        if (e.buttons === Button.LEFT)
        {
            this.startTranslation(new Vector(e.x, e.y))
        }
    }
    
    private onMouseMove(e: MouseEvent): void
    {
        if (e.buttons === Button.LEFT)
        {
            this.translate(new Vector(e.x, e.y))
        }
    }
    
    private onWheel(e: WheelEvent): void
    {
        let delta = e.deltaY * Transform.SPEED

        // Correct for translation so zoom happens around the cursor
        let mouse = new Vector(e.offsetX, e.offsetY).sub(this.navigator.getOrigin())
        let correction = mouse.mult((2 ** delta - 1) / this.scale) // Who thought algebra was actually useful?

        this.translation = this.translation.sub(correction)
        
        this.updateZoom(this.zoom - delta)
        this.onZoom()
    }


    private onTouchStart(e: TouchEvent): void
    {
        let touch = e.touches[0]
        this.startTranslation(new Vector(touch.clientX, touch.clientY))
    }

    private onTouchMove(e: TouchEvent): void
    {
        let touch = e.touches[0]
        this.translate(new Vector(touch.clientX, touch.clientY))
    }


    private startTranslation(initial: Vector): void
    {
        // Save initial mouse location and translation
        this.initial = initial
        this.initialTranslation = this.translation
    }
    
    private stopTranslation(): void
    {
        this.element.style.cursor = "default"
    }

    private translate(current: Vector): void
    {
        this.element.style.cursor = "all-scroll"

        // Calculate new translation vector
        let translation = this.initial.sub(current).div(this.scale)
        this.translation = this.initialTranslation.add(translation)

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


    public transform(vector: Vector): Vector
    {
        return vector.sub(this.translation).mult(this.scale)
    }

    public setTranslation(translation: Vector): void
    {
        this.translation = translation
        this.previousTranslation = translation
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

    public setZoom(zoom: number): void
    {
        this.updateZoom(zoom)
        this.previousZoom = Math.floor(zoom)
    }

    private updateZoom(zoom: number): void
    {
        this.zoom = zoom
        this.scale = 2 ** zoom
    }

}

export default Transform
