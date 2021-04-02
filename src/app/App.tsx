import React from "react"

import "./App.css"

import Map from "./Map"
import Stop from "./stop/Stop"

interface Props { }

interface State
{

    sidebar: boolean

    stop: Stop | null

}

class App extends React.Component<Props, State>
{

    private static instance: App

    public static getInstance(): App
    {
        return App.instance
    }


    public state: State = {
        sidebar: false,
        stop: null
    }


    public async componentDidMount(): Promise<void>
    {
        App.instance = this
    }


    public showSidebar(stop: Stop): void
    {
        this.setState({ sidebar: true, stop })
    }

    public hideSidebar(): void
    {
        this.setState({ sidebar: false })
    }


    public render(): React.ReactElement
    {
        return (
            <div>
                <Map />
                <div className={"sidebar" + (this.state.sidebar ? " shown" : "")}>
                    <div className="row">
                        <h1 className="stop">{this.state.stop?.getName()}</h1>
                    </div>
                </div>
            </div>
        )
    }

}

export default App
