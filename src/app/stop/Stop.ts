import VehicleType from "../../server/VehicleType"

class Stop
{

    private marker: google.maps.Marker


    public constructor(map: google.maps.Map, data: any)
    {
        // Create icon
        let scale = (data.vehicle_type === VehicleType.BUS) ? 5 : 8

        let icon: google.maps.Symbol = {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: "white", fillOpacity: 1,
            strokeWeight: scale / 2, scale 
        }

        // Create marker
        this.marker = new google.maps.Marker({
            position: {
                lat: data.latitude as number,
                lng: data.longitude as number
            },
            icon, map
        })

        // let window = new google.maps.InfoWindow({ content: data.name })
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
