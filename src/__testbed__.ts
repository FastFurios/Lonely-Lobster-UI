//
import { createReadStream } from "fs"
import { Interface, createInterface } from "readline"

const fileReaderConfig      = { input: createReadStream("data/workorders_010.csv"), terminal: false }
const lineReader: Interface = createInterface(fileReaderConfig)
lineReader.on('line', (line) => console.log(line))


