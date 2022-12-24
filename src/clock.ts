//----------------------------------------------------------------------
//    CLOCK TIME 
//----------------------------------------------------------------------
export type Timestamp = number
export type TimeUnit  = number

const timeUnit: TimeUnit = 1

export class Clock {
    public time: Timestamp

    constructor(public startTime: Timestamp = 0) { this.time = startTime }

    public setToNow = (time: Timestamp): void => { this.time = time; return } 

/*
    tick(): Timestamp {
        this.time += timeUnit
        return this.time            
    }
*/
}
