import axios from "axios"

import Stop from "../stop/Stop"
import Route from "./Route"
import RouteData from "../../server/data/RouteData"
import Transform from "../transform/Transform"
import VehicleType from "../../server/VehicleType"

class Routes
{

    private routes = new Map<string, Route>()
    private buses = new Map<string, Route>()


    public get(id: string): Route
    {
        if (this.buses.has(id))
        {
            return this.buses.get(id)!
        }
        return this.routes.get(id)!
    }

    public set(id: string, route: Route): void
    {
        if (route.getType() === VehicleType.BUS)
        {
            this.buses.set(id, route)
        }
        else
        {
            this.routes.set(id, route)
        }
    }

    public has(id: string): boolean
    {
        return this.buses.has(id) || this.routes.has(id)
    }

    public delete(id: string): void
    {
        if (this.buses.has(id))
        {
            this.buses.delete(id)
        }
        else
        {
            this.routes.delete(id)
        }
    }


    public getRoutes(): Route[]
    {
        return Array.from(this.routes.values())
    }

    public getBuses(): Route[]
    {
        return Array.from(this.buses.values())
    }

}

class RouteManager
{

    private routes = new Routes()
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

        let next = new Routes()
        for (let data of response.data.routes)
        {
            this.add(data, next)
        }
        
        this.routes = next
    }

    private add(data: RouteData, next: Routes): void
    {
        let id = data.id
        let route: Route

        if (this.routes.has(id))
        {
            // Repurpose old route
            route = this.routes.get(id)
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
        for (let route of this.routes.getBuses())
        {
            route.render(c)
        }
        for (let route of this.routes.getRoutes())
        {
            route.render(c)
        }
    }

}

export default RouteManager
