import { z } from 'zod'
import { NMEALineSchema, NMEASentenceSchema, ProtocolSchema, ProtocolsFileSchema, SentenceSchema } from './schemas'

// NMEA
export type NMEASentence = z.infer<typeof NMEASentenceSchema>
export type NMEALine = z.infer<typeof NMEALineSchema>

// Parser
export type ValidFrameResponse = {
  valid: boolean,
  data: string
}

export interface NMEAParser {
  getProtocols(): string[],
  addProtocol(protocol: any): void,
  parseData(data: string): any[],
}

// PROTOCOLS
export type Sentence = z.infer<typeof SentenceSchema>
export type Protocol = z.infer<typeof ProtocolSchema>
export type ProtocolsFile = z.infer<typeof ProtocolsFileSchema>