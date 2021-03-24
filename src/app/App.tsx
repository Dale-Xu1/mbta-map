import { Loader } from "@googlemaps/js-api-loader"
import React from "react"

import "./App.css"

class App extends React.Component
{

    private loader = new Loader({ apiKey: process.env.REACT_APP_MAPS_KEY!, libraries: ["geometry"] });
    private map!: google.maps.Map

    private div = React.createRef<HTMLDivElement>()


    public async componentDidMount(): Promise<void>
    {
        await this.loader.load()

        this.map = new google.maps.Map(this.div.current!, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
        })
    }

    public render(): React.ReactElement
    {
        return (
            <div id="map" ref={this.div}></div>
        )
    }

}

export default App
