import { Injectable } from '@angular/core';

export type PsInventoryWi = {
  id:                             number,
  accumulatedEffortInProcessStep: number,
  elapsedTimeInProcessStep:       number    
}

export type PsInventoryColumn = {
  colNr:  number,
  wis:    PsInventoryWi[]      
}

export type PsInventory = PsInventoryColumn[]     


@Injectable({
  providedIn: 'root'
})
export class WorkitemsInventoryService {

  public psInventory: PsInventory = [
    { colNr: 0,
      wis: [
        { id: 0,  accumulatedEffortInProcessStep: 0,   elapsedTimeInProcessStep: 0 }
      ] 
    },
    { colNr: 1,
      wis: [
        { id: 1,  accumulatedEffortInProcessStep: 1,   elapsedTimeInProcessStep: 1 },
        { id: 2,  accumulatedEffortInProcessStep: 0,   elapsedTimeInProcessStep: 1 },
        { id: 3,  accumulatedEffortInProcessStep: 1,   elapsedTimeInProcessStep: 1 },
        { id: 31,  accumulatedEffortInProcessStep: 1,   elapsedTimeInProcessStep: 1 },
        { id: 32,  accumulatedEffortInProcessStep: 1,   elapsedTimeInProcessStep: 1 },
      ] 
    },
    { colNr: 2,
      wis: [
        { id: 21,  accumulatedEffortInProcessStep: 1,   elapsedTimeInProcessStep: 2 },
        { id: 22,  accumulatedEffortInProcessStep: 3,   elapsedTimeInProcessStep: 2 },
      ] 
    },
    { colNr: 3,
      wis: [
      ]   
    },
    { colNr: 4,
      wis: [
        { id: 401,  accumulatedEffortInProcessStep: 1,   elapsedTimeInProcessStep: 2 },
      ]   
    },
    { colNr: 5,
      wis: [
        { id: 7,  accumulatedEffortInProcessStep: 4,   elapsedTimeInProcessStep: 3 },
        { id: 8,  accumulatedEffortInProcessStep: 4,   elapsedTimeInProcessStep: 5 },
      ] 
    }
  ]  
  
  constructor() { }

  public get processStepInventory(): PsInventory { return this.psInventory }
  
}
