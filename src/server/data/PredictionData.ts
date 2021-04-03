class PredictionData
{

    public name: string
    public description: string = ""

    public color: string
    public directions: string[]
    
    public inbound: string[] = []
    public outbound: string[] = []


    public constructor(data: any)
    {
        let attributes = data.attributes

        this.name = attributes.short_name

        if (this.name.length === 0) this.name = attributes.long_name
        else this.description = attributes.long_name

        this.color = "#" + attributes.color
        this.directions = attributes.direction_names
    }


    public add(data: any): void
    {
        // Remove predictions without times
        let time = data.arrival_time === null ? data.departure_time : data.arrival_time
        if (time === null) return

        let date = new Date(time)
        if (date.getTime() - Date.now() < 0) return // Remove if expired

        if (data.direction_id === 0) this.outbound.push(time)
        else this.inbound.push(time)
    }

}

export default PredictionData
