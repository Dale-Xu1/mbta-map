class TimeData
{

    public arrival: string | null
    public departure: string | null


    public constructor(data: any)
    {
        this.arrival = data.arrival_time
        this.departure = data.departure_time
    }

}

export default TimeData
