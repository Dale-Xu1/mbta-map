import StopType from "./StopType"

class Stop
{

    private marker: google.maps.Marker


    public constructor(map: google.maps.Map, name: string, type: StopType, latitude: number, longitude: number)
    {
        // Create icon
        let scale = (type === StopType.BUS) ? 5 : 8

        let icon: google.maps.Symbol = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "white", fillOpacity: 1,
            strokeWeight: scale / 2, scale 
        }

        // Create marker
        this.marker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            icon, map
        })

        // let window = new google.maps.InfoWindow({ content: name })
        // this.marker.addListener("click", () =>
        // {
        //     window.open(map, this.marker)
        // })
    }


    public remove(): void
    {
        this.marker.setMap(null)
    }

}

export default Stop
