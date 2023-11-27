import { z } from 'zod'
import {
  FieldTypeSchema, FieldSchema,
  ProtocolSchema, ProtocolsFileSchema, ProtocolSentenceSchema,
  VersionSchema, JSONSchemaInputSchema,
  StoredSentenceSchema, StoredSentencesSchema,
  NMEALikeSchema, NMEAUnparsedSentenceSchema, NMEAPreParsedSentenceSchema,
  DataSchema, FieldParsedSchema, NMEASentenceSchema, NMEAUknownSentenceSchema, NMEAKnownSentenceSchema,
} from './schemas'

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
export interface NMEAParser {
  addProtocols(protocol: any): void,
  getProtocols(): string[],
  getSentences(): string[],
  parseData(data: string): any[],
}