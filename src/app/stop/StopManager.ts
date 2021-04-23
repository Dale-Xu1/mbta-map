import axios from "axios"

import Navigator from "../Navigator"
import RouteManager from "../route/RouteManager"
import Stop from "./Stop"
import StopData from "../../server/data/StopData"
import LatLong from "../transform/LatLong"

class StopManager
{

    private routes: RouteManager

    private stops = new Map<string, Stop>()
    private next = new Map<string, Stop>()

    private index = 0


    public constructor(private navigator: Navigator)
    {
        this.routes = new RouteManager(navigator)
    }


    public async refresh(position: LatLong): Promise<void>
    {
        this.index++
        let index = this.index

        // Query stops
        let response = await axios.get(
            "/stops?latitude=" + position.latitude +
            "&longitude=" + position.longitude +
            "&zoom=" + this.navigator.getTransform().getZoom()
        )

        // If another call occured, discard response
        if (this.index !== index) return
        this.index = 0

        for (let data of response.data.stops)
        {
            this.add(data)
        }

        // Refresh routes
        // this.routes.refresh(this.stops)
        this.clear()
    }

    public render(c: CanvasRenderingContext2D): void
    {
        for (let stop of this.stops.values()) stop.renderBase(c)
        for (let stop of this.stops.values()) stop.render(c)
    }


    private add(data: StopData): void
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
            stop = new Stop(this.navigator, data)
        }

        this.next.set(id, stop)
    }
    
    private clear(): void
    {
        this.stops = this.next
        this.next = new Map<string, Stop>()
    }

}

export default StopManager
