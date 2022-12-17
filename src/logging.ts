//----------------------------------------------------------------------
//    LOGGING 
//----------------------------------------------------------------------
import { Timestamp } from './clock.js'
import { clock } from './_main.js'

export enum LogEntryType {
    workItemMovedTo   = "movedTo",
    workItemWorkedOn  = "workedOn",
    workerWorked      = "workerWorked"
}

export abstract class LogEntry { // records state at end of time unit
    public timestamp: Timestamp
    constructor (public logEntryType: LogEntryType) {  
        this.timestamp = clock.time
    }

    public abstract stringify: () => string
    public stringifyLe = () => `t = ${this.timestamp}` 
}
