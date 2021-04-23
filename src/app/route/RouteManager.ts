import axios from "axios"

import Navigator from "../Navigator"
import Stop from "../stop/Stop"
import Route from "./Route"
import RouteData from "../../server/data/RouteData"

class RouteManager
{

    private old = new Map<string, Route>()
    private routes = new Map<string, Route>()

    private index = 0


    public constructor(private navigator: Navigator) { }


    public async refresh(stops: Map<string, Stop>): Promise<void>
    {
        this.index++
        let index = this.index

        let ids: string[] = []
        for (let id of stops.keys())
        {
            ids.push(id)
        }

        // Query routes
        let response = await axios.get(
            "/routes?stops=" + ids.join(",") +
            "&zoom=" + this.navigator.getTransform().getZoom()
        )
        
        // If another call occured, discard response
        if (this.index !== index) return
        this.index = 0

        for (let data of response.data.routes)
        {
            this.add(data)
        }
        this.clear()
    }


    private add(data: RouteData): void
    {
        let id = data.id
        let route: Route

        if (this.old.has(id))
        {
            // Repurpose old route
            route = this.old.get(id)!
            this.old.delete(id)
        }
        else
        {
            // Create new route
            route = new Route(this.navigator, data)
        }

        this.routes.set(id, route)
    }
    
    private clear(): void
    {
        this.old = this.routes
        this.routes = new Map<string, Route>()
    }

}

export default RouteManager
