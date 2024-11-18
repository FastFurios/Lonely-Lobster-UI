// map that has a combined key with 2 string elements

export class DoubleStringMap<V> extends Map<string, V> {
    constructor() {
      super()
    }
    public dsSet(key: [string, string], val: V) {
      super.set(this.combineKeys(key), val)
    }
    public dsGet(key: [string, string]): V | undefined {
      return super.get(this.combineKeys(key))
    }
    public *dsEntries(): IterableIterator<[string, string, V]> {
      for (const [key, val] of this) {
        const [k1, k2] = key.split('.')
        yield [k1, k2, val]
      }
    }
    private combineKeys([key1, key2]: [string, string]): string {
      return `${key1}.${key2}`
    }
  }



  import { environment } from '../../environments/environment'
  import { EventTypeId, EventSeverity, ApplicationEvent } from './io_api_definitions'
  
  export function applicationEventFrom(at: string, moreContext: string, typeId: EventTypeId, sev: EventSeverity, desc?: string): ApplicationEvent {
    return {
        dateAndtime:    new Date(),
        source:         "frontend",
        sourceVersion:  environment.version,
        severity:       sev,
        typeId:         typeId,
        description:    desc ? desc : typeId.toString(),  // use detail description or if not available then standard text of event type
        context:        `${at}: ${moreContext}`
    }
}
  