class Vector
{

    public static ZERO = new Vector(0, 0)


    public constructor(public readonly x: number, public readonly y: number) { }


    public add(vector: Vector): Vector
    {
        return new Vector(this.x + vector.x, this.y + vector.y)
    }

    public sub(vector: Vector): Vector
    {
        return new Vector(this.x - vector.x, this.y - vector.y)
    }

    public mult(value: number): Vector
    {
        return new Vector(this.x * value, this.y * value)
    }

    public div(value: number): Vector
    {
        return new Vector(this.x / value, this.y / value)
    }

}

export default Vector
