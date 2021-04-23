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

    public negate(): Vector
    {
        return new Vector(-this.x, -this.y)
    }

    public div(value: number): Vector
    {
        return new Vector(this.x / value, this.y / value)
    }


    public magSq(): number
    {
        return (this.x * this.x) + (this.y * this.y)
    }

    public mag(): number
    {
        return Math.sqrt(this.magSq())
    }

    public normalize(): Vector
    {
        let magnitude = this.mag()
        return (magnitude > 0) ? this.div(magnitude) : this
    }

}

export default Vector
