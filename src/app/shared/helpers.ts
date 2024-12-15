//-------------------------------------------------------------------
// HELPERS
//-------------------------------------------------------------------
// last code cleaning: 15.12.2024

/**
 * This file contains general purpose helper functions and classes that might be also usaeable in other applications 
 */

/**
 * @class Map that has a combined key with 2 string elements: key e.g. ["abc", "def"] => value of type V
 */
export class DoubleStringMap<V> extends Map<string, V> {
    /**
     * @private
     */
    constructor() {
      super()
    }
  
    /** 
     * Set map entry 
     * @param key - a tuple of 2 strings; MUST NOT contain a '.' 
     * @param val - a value of type V 
     */
    public dsSet(key: [string, string], val: V) {
      super.set(this.combineKeys(key), val)
    }

    /** 
     * Get map entry's value 
     * @param key - a tuple of 2 strings 
     * @returns the value of type V or undefined if not found
     */
    public dsGet(key: [string, string]): V | undefined {
      return super.get(this.combineKeys(key))
    }

    /** 
     * Iterator to read the map entries one by one 
     * @returns iterable iterator yielding the map entries
     */
    public *dsEntries(): IterableIterator<[string, string, V]> {
      for (const [key, val] of this) {
        const [k1, k2] = key.split('.')
        yield [k1, k2, val]
      }
    }

    /** 
     * Combine the 2 strings into a single concatinated string with a '.' as delimiter    
     * @param key - a tuple of 2 strings 
     * @returns the combined string 
     */
    private combineKeys([key1, key2]: [string, string]): string {
      return `${key1}.${key2}`
    }
  }