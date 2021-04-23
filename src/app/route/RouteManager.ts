import axios from "axios"

import Stop from "../stop/Stop"
import Route from "./Route"
import RouteData from "../../server/data/RouteData"
import Transform from "../transform/Transform"

class RouteManager
{

    private routes = new Map<string, Route>()
    private index = 0


    public constructor(private transform: Transform) { }


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
            "&zoom=" + this.transform.getZoom()
        )
        
        // If another call occured, discard response
        if (this.index !== index) return
        this.index = 0

        let next = new Map<string, Route>()
        for (let data of response.data.routes)
        {
            this.add(data, next)
        }
        
        this.routes = next
    }

    private add(data: RouteData, next: Map<string, Route>): void
    {
        let id = data.id
        let route: Route

        if (this.routes.has(id))
        {
            // Repurpose old route
            route = this.routes.get(id)!
            this.routes.delete(id)
        }
        else
        {
            // Create new route
            route = new Route(this.transform, data)
        }

        next.set(id, route)
    }


    public render(c: CanvasRenderingContext2D): void
    {
        for (let route of this.routes.values())
        {
            route.render(c)
        }
    }

}

export default RouteManager
