import { Loader } from "@googlemaps/js-api-loader"
import React from "react"

import "./App.css"

import StopManager from "./stop/StopManager"

interface Props { }

interface State
{

    sidebar: boolean

}

class App extends React.Component<Props, State>
{

    private static instance: App

    public static getInstance(): App
    {
        return App.instance
    }


    public state: State = {
        sidebar: false
    }

    private map!: google.maps.Map
    private stops!: StopManager

    private div = React.createRef<HTMLDivElement>()


    public async componentDidMount(): Promise<void>
    {
        App.instance = this

        // Load Google Maps API
        let loader = new Loader({ apiKey: process.env.REACT_APP_MAP_KEY!, libraries: ["geometry"] });
        await loader.load()

        this.position = new google.maps.LatLng(42.3528392, -71.0706818)
        
        // Create map
        this.map = new google.maps.Map(this.div.current!, {
            center: this.position,
            zoom: 16
        })
        this.stops = new StopManager(this.map)

        this.map.addListener("center_changed", this.centerChanged.bind(this))
        this.map.addListener("zoom_changed", this.zoomChanged.bind(this))

        this.map.addListener("click", this.hideSidebar.bind(this))

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
    private timeout: NodeJS.Timeout | null = null

    private centerChanged(): void
    {
        let center = this.map.getCenter()!
        let distance = google.maps.geometry.spherical.computeDistanceBetween(center, this.position)

        // Refresh once user has moved far enough
        let zoom = this.map.getZoom()!
        let threshold = 8000 / zoom

        if (distance > threshold)
        {
            this.position = center
            this.refresh()
        }
    }

    private zoomChanged(): void
    {
        this.position = this.map.getCenter()!
        this.refresh()
    }

    private refresh(): void
    {
        // Cancel refresh from calling if another was requested
        if (this.timeout !== null)
        {
            clearTimeout(this.timeout)
        }

        // Wait before refreshing
        this.timeout = setTimeout(() =>
        {
            this.timeout = null
            this.stops.refresh(this.position)
        }, 300)
    }


    public showSidebar(id: string): void
    {
        this.setState({ sidebar: true })
    }

    private hideSidebar(): void
    {
        this.setState({ sidebar: false })
    }


    public render(): React.ReactElement
    {
        return (
            <div>
                <div id="map" ref={this.div}></div>
                <div className={"sidebar" + (this.state.sidebar ? " shown" : "")}>
                    Hello
                </div>
            </div>
        )
    }

}

export default App
