import { readdirSync } from 'node:fs'
import Path from 'node:path'
import { END_FLAG, END_FLAG_LENGTH, MAX_CHARACTERS, START_FLAG, START_FLAG_LENGTH } from "./constants";
import { BooleanSchema, NMEALikeSchema, NaturalSchema, ProtocolsInputSchema, StringSchema } from "./schemas";
import { Data, FieldType, NMEAKnownSentence, NMEAParser, NMEAPreParsed, NMEASentence, NMEAUknownSentence, ParserSentences, ProtocolsFile, ProtocolsInput, StoredSentence, StoredSentences } from "./types";
import { getStoreSentences, readProtocolsFile } from './protocols';
import { getNMEAUnparsedSentence } from './sentences';


export class Parser implements NMEAParser {
  // Memory - Buffer
  protected _memory: boolean = true
  get memory() { return this._memory }
  set memory(mem: boolean) { this._memory = BooleanSchema.parse(mem) }
  protected _buffer: string = ''
  protected _bufferLength: number = MAX_CHARACTERS
  get bufferLimit() { return this._bufferLength }
  set bufferLimit(limit: number) { this._bufferLength = NaturalSchema.parse(limit) }
  // Protocols
  protected _protocols: string[] = []
  // get protocols() { return this._protocols }
  // Sentences
  protected _sentences: StoredSentences = new Map()
  // get sentences() { return this._sentences }

  constructor(memory: boolean = false, limit: number = MAX_CHARACTERS) {
    this.memory = memory
    this.bufferLimit = limit
    // add NMEA standard frames
    this.readInternalProtocols()
  }

  private readInternalProtocols () {
    const folder = Path.join(__dirname, 'protocols')
    const files = readdirSync(folder, { encoding: 'utf-8' })
    files.forEach(file => {
      const absoluteFile = Path.join(folder, file)
      this.addProtocols({ file: absoluteFile} )
    })
  }

  private readProtocols(input: ProtocolsInput): ProtocolsFile {
    if (input.file !== undefined) return readProtocolsFile(input.file)
    if (input.content !== undefined) return input.content
    if (input.protocols !== undefined) return { protocols: input.protocols }
    throw new Error('Invalid protocols to add')
  }

  getProtocols(): string[] { return this._protocols }

  addProtocols(input: ProtocolsInput): void {
    const parsed = ProtocolsInputSchema.safeParse(input)
    if (!parsed.success) {
      const error = parsed.error
      console.error(`Invalid protocols to add\n\tError = ${error}`)
      throw error
    }
    const { protocols } = this.readProtocols(input)
    // Add to known protocols
    protocols.forEach(protocol => {
      const protocolName = protocol.protocol
      if (!this._protocols.includes(protocolName)) {
        this._protocols.push(protocolName)
      }
    })
    // Get sentences for new protocols
    const sentences = getStoreSentences({ protocols })
    // Add to known sentences
    this._sentences = new Map([...this._sentences, ...sentences])
  }

  getSentences(): ParserSentences {
    return Object.fromEntries(this._sentences.entries())
  }

  private getField(value: string, type: FieldType): Data {
    if (value.length === 0) return null

    switch (type) {
      case 'string':
        return value
      case 'bool':
      case 'boolean':
        return (Boolean(value)).valueOf()
      case 'float':
      case 'double':
      case 'number': {
        const number = parseFloat(value)
        if (!Number.isNaN(number)) return number
        throw new Error(`invalid float number -> ${value}} it is not an ${type}`)
      }
    }

    const number = parseInt(value)
    if (Number.isInteger(number)) return number
    throw new Error(`invalid integer -> ${value}} it is not an ${type}`)
  }

  private getUnknowFrame(sentence: NMEAPreParsed): NMEAUknownSentence {
    return { ...sentence, protocol: { name: 'UNKNOWN' } }
  }

  private getKnownFrame(preparsed: NMEAPreParsed): NMEAKnownSentence | null {
    const storedSentence = this._sentences.get(preparsed.sentence) as StoredSentence
    // Bad known frame
    if (storedSentence.fields.length !== preparsed.fields.length) {
      console.debug(`Invalid ${preparsed.sentence} sentence -> it has to have ${storedSentence.fields.length} fields but it contains ${preparsed.fields.length}`)
      return null
    }
    try {
      const knownSentence: NMEAKnownSentence = {...preparsed, ...storedSentence, data: [] } as NMEAKnownSentence
      preparsed.fields.forEach((value, index) => {
        const type = knownSentence.fields[index].type
        const data = this.getField(value, type)
        knownSentence.fields[index].data = data
        knownSentence.data.push(data)
      })
      return knownSentence
    } catch (error) {
      if (error instanceof Error) {
        console.debug(`Invalid NMEA Frame ${preparsed.sentence} -> ${preparsed.raw}\n\t${error.message}`)
      } else {
        console.error(error)
      }
    }
    return null
  }

  private getFrame(text: string, timestamp: number): NMEASentence | null {
    const unparsedSentence = getNMEAUnparsedSentence(text)
    // Not valid NMEA sentence
    if (unparsedSentence === null) {
      console.debug(`Invalid NMEA frame -> ${text}}`)
      return null
    }
    const preparsedSentence: NMEAPreParsed = { timestamp, ...unparsedSentence }
    // Unknown NMEA sentence
    if (!this._sentences.has(preparsedSentence.sentence)) {
      console.debug(`Unknown NMEA sentence -> ${text}`)
      return this.getUnknowFrame(preparsedSentence)
    }
    // Known NMEA sentence
    return this.getKnownFrame(preparsedSentence)
  }

  private getFrames(text: string): NMEASentence[] {
    const timestamp = Date.now()
    let frames: NMEASentence[] = []
    let pivot = 0

    while (pivot < text.length) {
      const start = text.indexOf(START_FLAG, pivot)
      if (start === -1) {
        this._buffer = ''
        break
      }

      const end = text.indexOf(END_FLAG, start + START_FLAG_LENGTH)
      if (end === -1) {
        if (this._memory) { this._buffer = text.slice(start) }
        break
      }

      const possibleFrame = text.slice(start, end + END_FLAG_LENGTH)
      const parsed = NMEALikeSchema.safeParse(possibleFrame)

      if (!parsed.success) {
        pivot = start + START_FLAG_LENGTH
        continue
      }

      const frame = this.getFrame(parsed.data, timestamp)
      if (frame === null) {
        pivot = start + START_FLAG_LENGTH
        continue
      }
      
      frames.push(frame)
      pivot = end + END_FLAG_LENGTH
    }
    return frames
  }

  parseData(text: string): NMEASentence[] {
    const parsed = StringSchema.safeParse(text)
    if (!parsed.success) return []
    const data = (this.memory) ? this._buffer + parsed.data : parsed.data
    return this.getFrames(data)
  }
}
