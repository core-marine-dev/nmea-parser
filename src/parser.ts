import { readdirSync } from 'node:fs'
import Path from 'node:path'
import { END_FLAG, END_FLAG_LENGTH, MAX_CHARACTERS, NMEA_ID_LENGTH, START_FLAG, START_FLAG_LENGTH } from "./constants";
import { BooleanSchema, NMEALikeSchema, NaturalSchema, ProtocolsInputSchema, StringSchema } from "./schemas";
import { Data, FieldType, FieldUnknown, NMEAKnownSentence, NMEALike, NMEAParser, NMEAPreParsed, NMEASentence, NMEAUknownSentence, ParserSentences, ProtocolOutput, ProtocolsFile, ProtocolsInput, Sentence, StoredSentence, StoredSentences } from "./types";
import { getSentencesByProtocol, getStoreSentences, readProtocolsFile, readProtocolsString } from './protocols';
import { generateSentenceFromModel, getFakeSentence, getNMEAUnparsedSentence } from './sentences';
import { getTalker } from './utils';


export class Parser implements NMEAParser {
  // Memory - Buffer
  protected _memory: boolean = true
  get memory() { return this._memory }
  set memory(mem: boolean) { this._memory = BooleanSchema.parse(mem) }
  protected _buffer: string = ''
  protected _bufferLength: number = MAX_CHARACTERS
  get bufferLimit() { return this._bufferLength }
  set bufferLimit(limit: number) { this._bufferLength = NaturalSchema.parse(limit) }
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
    if (input.content !== undefined) return readProtocolsString(input.content)
    if (input.protocols !== undefined) return { protocols: input.protocols }
    throw new Error('Invalid protocols to add')
  }

  getProtocols(): ProtocolOutput[] {
    return getSentencesByProtocol(this._sentences)
  }

  getSentence(id: string): Sentence {
    if (!StringSchema.safeParse(id).success || id.length < NMEA_ID_LENGTH) { return null }
    const aux = this._sentences.get(id) ?? null
    if (aux !== null) { return aux }
    const [talk, sent] = [id.slice(0, id.length - NMEA_ID_LENGTH), id.slice(- NMEA_ID_LENGTH)]
    const sentence = this._sentences.get(sent)
    if (sentence === undefined) { return null }
    const talker = getTalker(talk)
    return { ...sentence, talker }
  }

  addProtocols(input: ProtocolsInput): void {
    const parsed = ProtocolsInputSchema.safeParse(input)
    if (!parsed.success) {
      const error = parsed.error
      console.error('Invalid protocols to add')
      console.error(error)
      throw error
    }
    const { protocols } = this.readProtocols(input)
    // Get sentences for new protocols
    const sentences = getStoreSentences({ protocols })
    // Add to known sentences
    this._sentences = new Map([...this._sentences, ...sentences])
  }

  getSentences(): ParserSentences {
    return Object.fromEntries(this._sentences.entries())
  }

  getFakeSentenceByID(id: string): NMEALike | null{
    if (!StringSchema.safeParse(id).success || id.length < NMEA_ID_LENGTH) { return null }
    const aux = this._sentences.get(id) ?? null
    if (aux !== null) { return generateSentenceFromModel(aux) }
    const [_, sent] = [id.slice(0, id.length - NMEA_ID_LENGTH), id.slice(- NMEA_ID_LENGTH)]
    const sentence = this._sentences.get(sent)
    if (sentence === undefined) { return null }
    const mockSentence = generateSentenceFromModel(sentence)
    return getFakeSentence(mockSentence, id)
  }

  parseData(text: string): NMEASentence[] {
    const parsed = StringSchema.safeParse(text)
    if (!parsed.success) return []
    const data = (this.memory) ? this._buffer + parsed.data : parsed.data
    return this.getFrames(data)
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
        throw new Error(`invalid float number -> ${value} it is not an ${type}`)
      }
    }

    const number = parseInt(value)
    if (Number.isInteger(number)) return number
    throw new Error(`invalid integer -> ${value} it is not an ${type}`)
  }

  private getUnknowFrame(sentence: NMEAPreParsed): NMEAUknownSentence {
    const fields: FieldUnknown[] = sentence.data.map(value => ({
      name: 'unknown', type: 'string', data: value
    }))
    return { ...sentence, fields, protocol: { name: 'UNKNOWN' } }
  }

  private getKnownFrame(preparsed: NMEAPreParsed): NMEAKnownSentence | null {
    const storedSentence = this._sentences.get(preparsed.sentence) as StoredSentence
    // Bad known frame
    if (storedSentence.fields.length !== preparsed.data.length) {
      console.debug(`Invalid ${preparsed.sentence} sentence -> it has to have ${storedSentence.fields.length} fields but it contains ${preparsed.data.length}`)
      return null
    }
    try {
      const knownSentence = {...preparsed, ...storedSentence, data: [] as Data[] }
      preparsed.data.forEach((value, index) => {
        const type = knownSentence.fields[index].type
        const data = this.getField(value, type)
        // @ts-ignore
        knownSentence.fields[index].data = data
        knownSentence.data.push(data)
      })
      // @ts-ignore
      return knownSentence
    } catch (error) {
      if (error instanceof Error) {
        console.debug(`Invalid NMEA Frame ${preparsed.sentence} -> ${preparsed.raw}\n\t${error.message}`)
      } else {
        console.error('Parser.getKnownFrame')
        console.error(error)
      }
    }
    return null
  }

  private getKnownTalkerFrame(preparsed: NMEAPreParsed): NMEAKnownSentence | null {
    const { sentence: aux } = preparsed
    // Not valid NMEA sentence ID length
    if (aux.length < NMEA_ID_LENGTH) { return null }
    const [id, sentence] = [aux.slice(0, aux.length - NMEA_ID_LENGTH), aux.slice(- NMEA_ID_LENGTH)]
    // Unknown NMEA frame
    if (!this._sentences.has(sentence)) { return null }
    // Knowing the frame
    const knownSentence = this.getKnownFrame({ ...preparsed, sentence })
    if (knownSentence === null) { return null }
    if (knownSentence.data.length !== preparsed.data.length) { return null }
    // Knowing the talker
    const talker = getTalker(id)
    return { ...knownSentence, talker } 
  }

  private getFrame(text: string, timestamp: number): NMEASentence | null {
    const unparsedSentence = getNMEAUnparsedSentence(text)
    // Not valid NMEA sentence
    if (unparsedSentence === null) {
      console.debug(`Invalid NMEA frame -> ${text}`)
      return null
    }
    const preparsedSentence: NMEAPreParsed = { ...unparsedSentence, timestamp, talker: null }
    // Known NMEA sentence
    if (this._sentences.has(preparsedSentence.sentence)) {
      const sentence = this.getKnownFrame(preparsedSentence)
      if (sentence !== null) return sentence
    // Probably known sentence by talker ID
    } else {
      const sentence = this.getKnownTalkerFrame(preparsedSentence)
      if (sentence !== null) return sentence
    }
    // Unknown NMEA sentence
    console.debug(`Unknown NMEA sentence -> ${text}`)
    return this.getUnknowFrame(preparsedSentence)
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

}
