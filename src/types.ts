import { z } from 'zod'
import {
  FieldTypeSchema, FieldSchema,
  ProtocolSchema, ProtocolsFileSchema, ProtocolSentenceSchema,
  VersionSchema, JSONSchemaInputSchema,
  StoredSentenceSchema, StoredSentencesSchema,
  NMEALikeSchema, NMEAUnparsedSentenceSchema, NMEAPreParsedSentenceSchema,
  DataSchema, FieldParsedSchema, NMEASentenceSchema, NMEAUknownSentenceSchema, NMEAKnownSentenceSchema, ProtocolsInputSchema, FieldUnknownSchema,
} from './schemas'

// PROTOCOLS
export type FieldType = z.infer<typeof FieldTypeSchema>
export type Field = z.infer<typeof FieldSchema>
export type FieldUnknown = z.infer<typeof FieldUnknownSchema>
export type ProtocolSentence = z.infer<typeof ProtocolSentenceSchema>
export type Version = z.infer<typeof VersionSchema>
export type Protocol = z.infer<typeof ProtocolSchema>
export type ProtocolsFile = z.infer<typeof ProtocolsFileSchema>
export type StoredSentence = z.infer<typeof StoredSentenceSchema>
export type StoredSentences = z.infer<typeof StoredSentencesSchema>
export type ParserSentences = Record<string, StoredSentence>
// JSON Schema
export type JSONSchemaInput = z.infer<typeof JSONSchemaInputSchema>
// SENTENCES
export type NMEALike = z.infer<typeof NMEALikeSchema>
export type NMEAUnparsedSentence = z.infer<typeof NMEAUnparsedSentenceSchema>
export type NMEAPreParsed = z.infer<typeof NMEAPreParsedSentenceSchema>
export type Data = z.infer<typeof DataSchema>
export type FieldParsed = z.infer<typeof FieldParsedSchema>
export type NMEAUknownSentence = z.infer<typeof NMEAUknownSentenceSchema>
export type NMEAKnownSentence = z.infer<typeof NMEAKnownSentenceSchema>
export type NMEASentence = z.infer<typeof NMEASentenceSchema>
// PARSER
export type ProtocolsInput = z.infer<typeof ProtocolsInputSchema>

export interface NMEAParser {
  addProtocols(protocols: ProtocolsInput): void,
  getProtocols(): string[],
  getSentences(): ParserSentences,
  parseData(data: string): any[],
}
