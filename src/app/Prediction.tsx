import React from "react"

import RoutePrediction from "./prediction/RoutePrediction"

interface Props
{

    prediction: RoutePrediction

}

class Prediction extends React.Component<Props>
{

    private static components: Prediction[] = []
    private static timer: NodeJS.Timeout | null = null

    public static start(): void
    {
        // Update values every 15 seconds
        if (Prediction.timer !== null) clearInterval(Prediction.timer)
        Prediction.timer = setInterval(Prediction.update, 15000)
    }

    public static stop(): void
    {
        clearInterval(Prediction.timer!)
        Prediction.timer = null
    }

    private static update(): void
    {
        for (let component of Prediction.components)
        {
            // Recalculate times
            component.forceUpdate()
        }
    }


    public componentDidMount(): void
    {
        // Subscribe to refresh calls
        Prediction.components.push(this)
    }

    public componentWillUnmount(): void
    {
        // Unsubscribe
        let components = Prediction.components
        components.splice(components.indexOf(this), 1)
    }

    public render(): React.ReactElement
    {
        let prediction = this.props.prediction

        let inbound = prediction.getInbound()
        let outbound = prediction.getOutbound()

        return (
            <div className="route" style={{ borderLeft: "10px solid " + prediction.getColor() }}>
                <div>
                    <h1>{prediction.getName()}</h1>
                    <span>{prediction.getDescription()}</span>
                </div>
                <div className="times">
                    {
                        (inbound === null) ? "" :
                        <div className="direction">
                            <h2>{prediction.getDirections()[1]}</h2>
                            <span>{inbound} min</span>
                        </div>
                    }
                    {
                        (outbound === null) ? "" :
                        <div>
                            <h2>{prediction.getDirections()[0]}</h2>
                            <span>{outbound} min</span>
                        </div>
                    }
                </div>
            </div>
        )
    }

}

export default Prediction
