import TimeData from "../../server/data/TimeData"

class Time
{

    private arrival: Date | null
    private departure: Date | null


    public constructor(data: TimeData)
    {
        this.arrival = data.arrival === null ? null : new Date(data.arrival)
        this.departure = data.departure === null ? null : new Date(data.departure)
    }


    public formatted(): number | null
    {
        // Get arrival time (fallback to departure time)
        let date = this.arrival === null ? this.departure : this.arrival
        if (this.notExpired(date))
        {
            let difference = date!.getTime() - Date.now()
            let minutes = Math.ceil(difference / 60000)

            return minutes
        }
        
        // Retain 0 minutes until departure expires
        if (this.notExpired(this.departure)) return 0
        return null
    }

    private notExpired(date: Date | null): boolean
    {
        return date !== null && date.getTime() - Date.now() >= 0
    }

}

export default Time
