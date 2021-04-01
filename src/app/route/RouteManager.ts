import axios from "axios"

import Stop from "../stop/Stop"
import Route from "./Route"

class RouteManager
{

    private old = new Map<string, Route>()
    private routes = new Map<string, Route>()


    public constructor(private map: google.maps.Map) { }


    public async refresh(stops: Map<string, Stop>): Promise<void>
    {
        let ids: string[] = []
        for (let id of stops.keys())
        {
            ids.push(id)
        }

        // Query routes
        let response = await axios.get("/routes?stops=" + ids.join(","))
        for (let route of response.data)
        {
            this.add(route.id, route.attributes)
        }

        this.clear()
    }


    private add(id: string, data: any): void
    {
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
            route = new Route(this.map, id, data)
        }

        this.routes.set(id, route)
    }
    
    private clear(): void
    {
        // Remove offscreen markers
        for (let route of this.old.values())
        {
            route.remove()
        }

        this.old = this.routes
        this.routes = new Map<string, Route>()
    }

}

export default RouteManager
