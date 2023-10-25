import { z } from 'zod'
import {
  NMEALineSchema, NMEASentenceSchema,
  ProtocolSchema, ProtocolsFileSchema, ProtocolSentenceSchema,
  FieldTypeSchema, FieldSchema,
  VersionSchema, JSONSchemaInputSchema, StoredSentenceSchema, StoredSentencesSchema
} from './schemas'

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
export type FieldType = z.infer<typeof FieldTypeSchema>

export type Field = z.infer<typeof FieldSchema>

export type ProtocolSentence = z.infer<typeof ProtocolSentenceSchema>

export type Version = z.infer<typeof VersionSchema>

export type Protocol = z.infer<typeof ProtocolSchema>

export type ProtocolsFile = z.infer<typeof ProtocolsFileSchema>

export type StoredSentence = z.infer<typeof StoredSentenceSchema>

export type StoredSentences = z.infer<typeof StoredSentencesSchema>
// JSON Schema
export type JSONSchemaInput = z.infer<typeof JSONSchemaInputSchema>