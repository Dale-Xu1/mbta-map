import Vector from "./Vector"
import Navigator from "../Navigator"
import LatLong from "./LatLong"

enum Button
{

    NONE,

    LEFT,
    RIGHT

}

class Transform
{

    private static SCALE = 256
    private static SPEED = 0.0016
    

    public static toWorld(position: LatLong): Vector
    {
        let x = position.longitude * Transform.SCALE / 360

        // I have no idea what this means
        let tan = Math.tan(Math.PI / 4 + (position.latitude * Math.PI / 360))
        let y = -Math.log(tan) * Transform.SCALE / (2 * Math.PI)

        return new Vector(x, y)
    }

    public static toCoordinates(vector: Vector): LatLong
    {
        let longitude = vector.x / Transform.SCALE * 360

        // Literally the opposite of the other function
        let exp = Math.exp(-vector.y / Transform.SCALE * 2 * Math.PI)
        let latitude = (Math.atan(exp) - (Math.PI / 4)) / Math.PI * 360

        return new LatLong(latitude, longitude)
    }


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

            this.onMove()
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
        let position = Transform.toCoordinates(this.translation)
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
