import axios from "axios"
import React from "react"

import "./index.css"

import NavigatorMap from "./NavigatorMap"
import Prediction from "./Prediction"
import RoutePrediction from "./prediction/RoutePrediction"
import Stop from "./stop/Stop"

interface Props { }

interface State
{

    sidebar: boolean

    stop: Stop | null
    predictions: RoutePrediction[] | null

}

class App extends React.Component<Props, State>
{

    private static instance: App

    public static getInstance(): App
    {
        return App.instance
    }

    public componentDidMount(): void
    {
        App.instance = this
    }


    public state: State =
    {
        sidebar: false,
        
        stop: null,
        predictions: null
    }


    private timer: NodeJS.Timeout | null = null

    public async showSidebar(stop: Stop): Promise<void>
    {
        if (this.state.stop === stop) return
        Prediction.start()
        
        this.setState({
            sidebar: true,
            stop,
            predictions: null
        })

        // Query API every 60 seconds for updates
        this.refresh()
        this.timer = setInterval(this.refresh.bind(this), 60000)
    }

    public hideSidebar(): void
    {
        if (this.state.sidebar)
        {
            // Stop refreshing
            Prediction.stop()

            clearInterval(this.timer!)
            this.timer = null

            this.setState({ sidebar: false })
        }
    }

    private async refresh(): Promise<void>
    {
        // Query predictions
        let response = await axios.get("/predictions?stop=" + this.state.stop!.getId())
        let predictions: RoutePrediction[] = []

        for (let data of response.data.predictions)
        {
            predictions.push(new RoutePrediction(data))
        }

        this.setState({ predictions })
    }


    public render(): React.ReactElement
    {
        let stop = this.state.stop

        return (
            <div>
                <NavigatorMap />
                <div className={"sidebar" + (this.state.sidebar ? " shown" : "")}>
                    {
                        stop === null ? "" :
                            <div className="title">
                                <h1>{stop.getName()}</h1>
                                <span>{stop.getDescription()}</span>
                            </div>
                    }
                    {this.state.predictions === null ? "" : this.getPredictions()}
                </div>
            </div>
        )
    }

    private getPredictions(): React.ReactElement[] | React.ReactElement
    {
        let routes = this.state.predictions!

        // Convert data to components
        let predictions: React.ReactElement[] = []
        for (let i = 0; i < routes.length; i++)
        {
            let prediction = routes[i]
            predictions.push(<Prediction prediction={prediction} key={i} />)
        }

        return predictions
    }

}

export default App
