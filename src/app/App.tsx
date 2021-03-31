import { Loader } from "@googlemaps/js-api-loader"
import React from "react"

import "./App.css"

import StopManager from "./stop/StopManager"

class App extends React.Component
{

    private map!: google.maps.Map
    private stops!: StopManager

    private div = React.createRef<HTMLDivElement>()


    public async componentDidMount(): Promise<void>
    {
        // Load Google Maps API
        let loader = new Loader({ apiKey: process.env.REACT_APP_MAP_KEY!, libraries: ["geometry"] });
        await loader.load()

        this.position = new google.maps.LatLng(42.3528392, -71.0706818)

        // Create map
        this.map = new google.maps.Map(this.div.current!, {
            center: this.position,
            zoom: 15
        })
        this.stops = new StopManager(this.map)

        this.map.addListener("center_changed", this.centerChanged.bind(this))

        // Get current location of user
        navigator.geolocation.getCurrentPosition(this.initializeMap.bind(this), this.initializeDefault.bind(this))
    }

    private initializeMap(result: GeolocationPosition): void
    {
        // Center map on position
        let position = result.coords
        this.position = new google.maps.LatLng(position.latitude, position.longitude)

        this.map.setCenter(this.position)
        this.stops.refresh(this.position)
    }

    private initializeDefault(): void
    {
        this.stops.refresh(this.position)
    }


    private position!: google.maps.LatLng

    private async centerChanged(): Promise<void>
    {
        let center = this.map.getCenter()!
        let distance = google.maps.geometry.spherical.computeDistanceBetween(center, this.position)

        // Refresh once user has moved far enough
        if (distance > 500)
        {
            console.log("refresh!")
            this.position = center
            this.stops.refresh(center)
        }
    }


    public render(): React.ReactElement
    {
        return (
            <div id="map" ref={this.div}></div>
        )
    }

}

export default App
