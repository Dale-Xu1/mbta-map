import RouteManager from "../route/RouteManager"
import Stop from "./Stop"
import VehicleType from "./VehicleType"

class StopManager
{

    private static ALL = [VehicleType.LIGHT_RAIL, VehicleType.HEAVY_RAIL, VehicleType.COMMUTER_RAIL, VehicleType.BUS, VehicleType.FERRY].join(",")
    private static NO_BUS = [VehicleType.LIGHT_RAIL, VehicleType.HEAVY_RAIL, VehicleType.COMMUTER_RAIL, VehicleType.FERRY].join(",")


    private routes: RouteManager

    private old = new Map<string, Stop>()
    private stops = new Map<string, Stop>()


    public constructor(private map: google.maps.Map)
    {
        this.routes = new RouteManager(map)
    }


    public async refresh(position: google.maps.LatLng): Promise<void>
    {
        let zoom = this.map.getZoom()!

        // Stop showing buses when below 16, only show commuter rail below 11
        let types = (zoom >= 16) ? StopManager.ALL : (zoom >= 13) ? StopManager.NO_BUS : VehicleType.COMMUTER_RAIL
        let radius = 1 / (2 ** (zoom - 10))

        // Query stops
        let respose = await fetch(`https://api-v3.mbta.com/stops?filter[latitude]=${position.lat()}&filter[longitude]=${position.lng()}&filter[route_type]=${types}&filter[radius]=${radius}&api_key=${process.env.REACT_APP_MBTA_KEY}`)
        let json = await respose.json()

        for (let stop of json.data)
        {
            this.add(stop.id, stop.attributes)
        }

        // Refresh routes
        this.routes.refresh(this.stops)
        this.clear()
    }


    private add(id: string, data: any): void
    {
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
