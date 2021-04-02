import axios from "axios"

import RouteManager from "../route/RouteManager"
import Stop from "./Stop"
import StopData from "../../server/data/StopData"

class StopManager
{

    private routes: RouteManager

    private old = new Map<string, Stop>()
    private stops = new Map<string, Stop>()

    private index = 0


    public constructor(private map: google.maps.Map)
    {
        this.routes = new RouteManager(map)
    }


    public async refresh(position: google.maps.LatLng): Promise<void>
    {
        this.index++
        let index = this.index

        // Query stops
        let response = await axios.get(
            "/stops?latitude=" + position.lat() +
            "&longitude=" + position.lng() +
            "&zoom=" + this.map.getZoom()!
        )

        // If another call occured, discard response
        if (this.index !== index) return
        this.index = 0

        for (let data of response.data.stops)
        {
            this.add(data)
        }

        // Refresh routes
        this.routes.refresh(this.stops)
        this.clear()
    }


    private add(data: StopData): void
    {
        let id = data.id
        let stop: Stop

        if (this.old.has(id))
        {
            // Repurpose old stop
            stop = this.old.get(id)!
            this.old.delete(id)
        }
        else
        {
            // Create new stop
            stop = new Stop(this.map, data)
        }

        this.stops.set(id, stop)
    }
    
    private clear(): void
    {
        // Remove offscreen markers
        for (let stop of this.old.values())
        {
            stop.remove()
        }

        this.old = this.stops
        this.stops = new Map<string, Stop>()
    }

}

export default StopManager
