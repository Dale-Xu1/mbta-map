import PredictionData from "../../server/data/PredictionData"
import Time from "./Time"

class RoutePrediction
{

    private name: string
    private color: string

    private directions: string[]

    private inbound: Time[] = []
    private outbound: Time[] = []


    public constructor(data: PredictionData)
    {
        this.name = data.name

        this.color = data.color
        this.directions = data.directions

        for (let time of data.inbound)
        {
            this.inbound.push(new Time(time))
        }

        for (let time of data.outbound)
        {
            this.outbound.push(new Time(time))
        }
    }


    public getName(): string
    {
        return this.name
    }

    public getColor(): string
    {
        return this.color
    }

    public getDirections(): string[]
    {
        return this.directions
    }


    public getInbound(): number | null
    {
        if (this.inbound.length < 1) return null
        let result = this.inbound[0].formatted()

        if (result === null)
        {
            // Prediction has expired
            this.inbound.shift()
            return this.getInbound()
        }

        return result
    }

    public getOutbound(): number | null
    {
        if (this.outbound.length < 1) return null
        let result = this.outbound[0].formatted()

        if (result === null)
        {
            // Prediction has expired
            this.outbound.shift()
            return this.getOutbound()
        }

        return result
    }

}

export default RoutePrediction
