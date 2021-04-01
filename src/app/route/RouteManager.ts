import Stop from "../stop/Stop"
import Route from "./Route"

class RouteManager
{

    private old = new Map<string, Route>()
    private stops = new Map<string, Route>()


    public constructor(private map: google.maps.Map) { }


    public async refresh(stops: Map<string, Stop>): Promise<void>
    {
        let ids: string[] = []
        for (let id of stops.keys())
        {
            ids.push(id)
        }

        // Query routes
        let respose = await fetch(`https://api-v3.mbta.com/routes?filter[stop]=${ids.join(",")}&api_key=${process.env.REACT_APP_MBTA_KEY}`)
        let json = await respose.json()

        console.log(json.data)
        for (let route of json.data)
        {

        }
    }

}

export default RouteManager
