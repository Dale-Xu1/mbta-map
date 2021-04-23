import axios from "axios"

import Navigator from "../Navigator"
import RouteManager from "../route/RouteManager"
import Stop from "./Stop"
import StopData from "../../server/data/StopData"
import LatLong from "../transform/LatLong"
import Vector from "../transform/Vector"
import Transform from "../transform/Transform"

class StopManager
{

    private transform: Transform
    private routes: RouteManager
    
    private stops = new Map<string, Stop>()

    private drag = false
    private index = 0


    public constructor(private navigator: Navigator, element: HTMLElement)
    {
        this.transform = navigator.getTransform()
        this.routes = new RouteManager(navigator.getTransform())

        element.addEventListener("mousedown", () => this.drag = false)
        element.addEventListener("mousemove", () => this.drag = true)
        element.addEventListener("mouseup", this.onClick.bind(this))
    }

    private onClick(e: MouseEvent): void
    {
        // Ignore click if a drag occured
        if (this.drag) return

        let app = this.navigator.props.app
        let mouse = new Vector(e.offsetX, e.offsetY).sub(this.navigator.getOrigin())
        
        for (let stop of this.stops.values())
        {
            // Test stops to see if one was selected
            if (stop.isSelected(mouse))
            {
                app.showSidebar(stop)
                return
            }
        }

        app.hideSidebar()
    }


    public async refresh(position: LatLong): Promise<void>
    {
        this.index++
        let index = this.index

        // Query stops
        let response = await axios.get(
            "/stops?latitude=" + position.latitude +
            "&longitude=" + position.longitude +
            "&zoom=" + this.transform.getZoom()
        )

        // If another call occured, discard response
        if (this.index !== index) return
        this.index = 0

        let next = new Map<string, Stop>()
        for (let data of response.data.stops)
        {
            this.add(data, next)
        }

        // Refresh routes
        this.stops = next
        this.routes.refresh(this.stops)
    }

    public render(c: CanvasRenderingContext2D): void
    {
        this.routes.render(c)

        for (let stop of this.stops.values())
        {
            stop.renderBase(c)
        }
        for (let stop of this.stops.values())
        {
            stop.render(c)
        }
    }


    private add(data: StopData, next: Map<string, Stop>): void
    {
        let id = data.id
        let stop: Stop

        if (this.stops.has(id))
        {
            // Repurpose old stop
            stop = this.stops.get(id)!
            this.stops.delete(id)
        }
        else
        {
            // Create new stop
            stop = new Stop(this.transform, data)
        }

        next.set(id, stop)
    }

}

export default StopManager
