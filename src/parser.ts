import { readdirSync } from 'node:fs'
import Path from 'node:path'
import { MAX_CHARACTERS } from "./constants";
import { BooleanSchema, NaturalSchema } from "./schemas";
import { NMEAParser, StoredSentences } from "./types";
import { getStoreSentences, readProtocolsFile } from './protocols';


export class Parser implements NMEAParser {
  // Memory - Buffer
  protected _memory: boolean = true
  get memory() { return this._memory }
  set memory(mem: boolean) { this._memory = BooleanSchema.parse(mem) }
  protected _buffer: string[] = []
  protected _bufferLength: number = MAX_CHARACTERS
  get bufferLimit() { return this._bufferLength }
  set bufferLimit(limit: number) { this._bufferLength = NaturalSchema.parse(limit) }
  // Protocols
  protected _protocols: string[] = []
  // get protocols() { return this._protocols }
  // Sentences
  protected _sentences: StoredSentences = new Map()
  // get sentences() { return this._sentences.keys() }
  
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
      this.addProtocols(absoluteFile)
    })
  }

  getProtocols(): string[] { return this._protocols }

  addProtocols(file: string): void {
    // Get protocols from file
    const { protocols } = readProtocolsFile(file)
    // Add to known protocols
    protocols.forEach(protocol => {
      const protocalName = protocol.protocol
      if (!this._protocols.includes(protocalName)) {
        this._protocols.push(protocalName)
      }
    })
    // Get sentences for new protocols
    const sentences = getStoreSentences({ protocols })
    // Add to known sentences
    this._sentences = new Map([...this._sentences, ...sentences])
  }

  getSentences(): string[] {
    return [...this._sentences.keys()]
  }

  parseData(text: string): any[] {
    // const parsed = StringSchema.safeParse(text)
    // if (!parsed.success) return []
    // const frames = this.getFrames(parsed.data)
    // TODO:
    return['TODO:']
  }

}
