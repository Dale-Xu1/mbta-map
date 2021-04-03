import axios from "axios"
import React from "react"

import "./App.css"

import NavigatorMap from "./NavigatorMap"
import Prediction from "./Prediction"
import RoutePrediction from "./prediction/RoutePrediction"
import Stop from "./stop/Stop"

interface Props { }

interface State
{

    sidebar: boolean

    stop: Stop | null
    predictions: RoutePrediction[]

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
        predictions: []
    }


    public async showSidebar(stop: Stop): Promise<void>
    {
        Prediction.start()
        this.setState({ sidebar: true, stop })

        // Query predictions
        let response = await axios.get("/predictions?stop=" + stop.getId())
        let predictions: RoutePrediction[] = []

        for (let data of response.data.predictions)
        {
            predictions.push(new RoutePrediction(data))
        }

        this.setState({ predictions })
    }

    public hideSidebar(): void
    {
        if (this.state.sidebar)
        {
            Prediction.stop()
            this.setState({ sidebar: false })
        }
    }


    public render(): React.ReactElement
    {
        return (
            <div>
                <NavigatorMap />
                <div className={"sidebar" + (this.state.sidebar ? " shown" : "")}>
                    <div className="title">
                        <h1>{this.state.stop?.getName()}</h1>
                    </div>
                    {
                        this.state.predictions.map((prediction: RoutePrediction, i: number) =>
                            <Prediction prediction={prediction} key={i} />)
                    }
                </div>
            </div>
        )
    }

}

export default App
