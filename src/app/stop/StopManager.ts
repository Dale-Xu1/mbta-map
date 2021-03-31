import Stop from "./Stop"

class StopManager
{

    private old = new Map<string, Stop>()
    private stops = new Map<string, Stop>()


    public constructor(private map: google.maps.Map) { }


    public async refresh(position: google.maps.LatLng): Promise<void>
    {
        // Refresh stops
        let respose = await fetch(`https://api-v3.mbta.com/stops?filter[latitude]=${position.lat()}&filter[longitude]=${position.lng()}&api_key=${process.env.REACT_APP_MBTA_KEY}`)
        let json = await respose.json()

        for (let stop of json.data)
        {
            let latitude = stop.attributes.latitude as number
            let longitude = stop.attributes.longitude as number

            this.add(stop.id, latitude, longitude)
        }

        this.clear()
    }


    private add(id: string, latitude: number, longitude: number): void
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
            stop = new Stop(this.map, latitude, longitude)
        }

        this.stops.set(id, stop)
    }
    
    private clear(): void
    {
        // Remove offscreen markers
        for (let [_, stop] of this.old)
        {
            stop.remove()
        }

        this.old = this.stops
        this.stops = new Map<string, Stop>()
    }

}

export default StopManager
