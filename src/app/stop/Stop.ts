import StopType from "./StopType"

class Stop
{

    private marker: google.maps.Marker


    public constructor(map: google.maps.Map, name: string, type: StopType, latitude: number, longitude: number)
    {
        // Create marker
        this.marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map
        })

        let window = new google.maps.InfoWindow({ content: name })
        this.marker.addListener("click", () =>
        {
            window.open(map, this.marker)
        })
    }


    public remove(): void
    {
        this.marker.setMap(null)
    }

}

export default Stop
