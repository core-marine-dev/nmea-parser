import { z } from 'zod'
import {
  FieldTypeSchema, FieldSchema,
  ProtocolSchema, ProtocolsFileSchema, ProtocolSentenceSchema,
  VersionSchema, JSONSchemaInputSchema,
  StoredSentenceSchema, StoredSentencesSchema,
  NMEALikeSchema, NMEAUnparsedSentenceSchema, NMEAPreParsedSentenceSchema,
  DataSchema, FieldParsedSchema, NMEASentenceSchema, NMEAUknownSentenceSchema, NMEAKnownSentenceSchema, ProtocolsInputSchema, FieldUnknownSchema, OutputSentenceSchema, TalkerSchema, IntegerSchema, Int8Schema, Int16Schema, Int32Schema, Uint8Schema, Uint16Schema, Uint32Schema, BigIntegerSchema, BigNaturalSchema, StoredSentenceDataSchema,
} from './schemas'
// COMMONS
export type Integer = z.infer<typeof IntegerSchema>
export type Int8 = z.infer<typeof Int8Schema>
export type Int16 = z.infer<typeof Int16Schema>
export type Int32 = z.infer<typeof Int32Schema>
export type BigInteger = z.infer<typeof BigIntegerSchema>
// export type Int64 = z.infer<typeof Int64Schema>
export type Natural = z.infer<typeof IntegerSchema>
export type Uint8 = z.infer<typeof Uint8Schema>
export type Uint16 = z.infer<typeof Uint16Schema>
export type Uint32 = z.infer<typeof Uint32Schema>
export type BigNatural = z.infer<typeof BigNaturalSchema>
// export type Uint64 = z.infer<typeof Uint64Schema>

// PROTOCOLS
export type FieldType = z.infer<typeof FieldTypeSchema>
export type Field = z.infer<typeof FieldSchema>
export type FieldUnknown = z.infer<typeof FieldUnknownSchema>
export type ProtocolSentence = z.infer<typeof ProtocolSentenceSchema>
export type Version = z.infer<typeof VersionSchema>
export type Protocol = z.infer<typeof ProtocolSchema>
export type ProtocolsFile = z.infer<typeof ProtocolsFileSchema>
export type ProtocolsInput = z.infer<typeof ProtocolsInputSchema>
export type StoredSentence = z.infer<typeof StoredSentenceSchema>
export type StoredSentences = z.infer<typeof StoredSentencesSchema>
export type ParserSentences = Record<string, StoredSentence>
// JSON Schema
export type JSONSchemaInput = z.infer<typeof JSONSchemaInputSchema>
// SENTENCES
export type NMEALike = z.infer<typeof NMEALikeSchema>
export type Talker = z.infer<typeof TalkerSchema>
export type NMEAUnparsedSentence = z.infer<typeof NMEAUnparsedSentenceSchema>
export type NMEAPreParsed = z.infer<typeof NMEAPreParsedSentenceSchema>
export type Data = z.infer<typeof DataSchema>
export type FieldParsed = z.infer<typeof FieldParsedSchema>
export type StoredSentenceData = z.infer<typeof StoredSentenceDataSchema>
export type NMEAUknownSentence = z.infer<typeof NMEAUknownSentenceSchema>
export type NMEAKnownSentence = z.infer<typeof NMEAKnownSentenceSchema>
export type NMEASentence = z.infer<typeof NMEASentenceSchema>
export type OutputSentence = z.infer<typeof OutputSentenceSchema>
export type Sentence = null | OutputSentence
// PARSER
export type ProtocolOutput = {
  protocol: string,
  version?: string,
  sentences: string[]
}
export interface NMEAParser {
  parseData(data: string): NMEASentence[],
  addProtocols(protocols: ProtocolsInput): void,
  getProtocols(): ProtocolOutput[],
  getSentence(id: string): Sentence,
  getFakeSentenceByID(id: string): NMEALike | null
}
