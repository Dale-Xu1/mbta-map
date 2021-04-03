import PredictionData from "../../server/data/PredictionData"

class RoutePrediction
{

    private name: string
    private description: string

    private color: string

    private directions: string[]

    private inbound: Date[] = []
    private outbound: Date[] = []


    public constructor(data: PredictionData)
    {
        this.name = data.name
        this.description = data.description

        this.color = data.color
        this.directions = data.directions

        for (let time of data.inbound)
        {
            this.inbound.push(new Date(time))
        }

        for (let time of data.outbound)
        {
            this.outbound.push(new Date(time))
        }
    }


    public getName(): string
    {
        return this.name
    }

    public getDescription(): string
    {
        return this.description
    }

    public getColor(): string
    {
        return this.color
    }

    public getDirections(): string[]
    {
        return this.directions
    }

    
    private format(date: Date): number
    {
        let difference = date.getTime() - Date.now()
        
        let minutes = Math.ceil(difference / 60000)
        return minutes
    }

    public getInbound(): number | null
    {
        if (this.inbound.length < 1) return null
        let result = this.format(this.inbound[0])

        if (result <= 0)
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
        let result = this.format(this.outbound[0])

        if (result <= 0)
        {
            // Prediction has expired
            this.outbound.shift()
            return this.getOutbound()
        }

        return result
    }


    public add(data: any): void
    {
        // Remove predictions without times
        let time = data.arrival_time === null ? data.departure_time : data.arrival_time
        if (time === null) return

        let date = new Date(time)
        if (date.getTime() - Date.now() < 0) return // Remove if expired

        if (data.direction_id === 0) this.outbound.push(date)
        else this.inbound.push(date)
    }

}

export default RoutePrediction
