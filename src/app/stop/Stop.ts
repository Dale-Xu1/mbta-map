import StopData from "../../server/data/StopData"
import VehicleType from "../../server/VehicleType"
import App from "../App"

class Stop
{

    private id: string

    private name: string
    private description: string

    private marker: google.maps.Marker


    public constructor(map: google.maps.Map, data: StopData)
    {
        this.id = data.id

        this.name = data.name
        this.description = data.description

        // Create icon
        let scale = (data.type === VehicleType.BUS) ? 5 : 8

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

        this.marker.addListener("click", this.click.bind(this))
    }


    public getId(): string
    {
        return this.id
    }

    public getName(): string
    {
        return this.name
    }

    public getDescription(): string
    {
        return this.description
    }


    private click(): void
    {
        // Show prediction data on sidebar
        App.getInstance().showSidebar(this)
    }

    public remove(): void
    {
        this.marker.setMap(null)
    }

}

export default Stop
