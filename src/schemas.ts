import { z } from 'zod'
import { DELIMITER, END_FLAG, INT16_MAX, INT16_MIN, INT32_MAX, INT32_MIN, INT8_MAX, INT8_MIN, SEPARATOR, START_FLAG, UINT16_MAX, UINT32_MAX, UINT8_MAX } from './constants'
// COMMONS
export const StringSchema = z.string()
export const StringArraySchema = z.array(StringSchema)
export const BooleanSchema = z.boolean()
export const NumberSchema = z.number()
export const IntegerSchema = NumberSchema.int()
export const Int8Schema =  IntegerSchema.min(INT8_MIN).max(INT8_MAX)
export const Int16Schema = IntegerSchema.min(INT16_MIN).max(INT16_MAX)
export const Int32Schema = IntegerSchema.min(INT32_MIN).max(INT32_MAX)
export const BigIntegerSchema = z.bigint()
// export const Int64Schema = IntegerSchema.min(INT64_MIN).max(INT64_MAX)
export const NaturalSchema = IntegerSchema.nonnegative()
export const Uint8Schema = NaturalSchema.max(UINT8_MAX)
export const Uint16Schema = NaturalSchema.max(UINT16_MAX)
export const Uint32Schema = NaturalSchema.max(UINT32_MAX)
export const BigNaturalSchema = BigIntegerSchema.positive()
// export const Uint64Schema = NaturalSchema.max(UINT64_MAX)

// PROTOCOLS
export const FieldTypeSchema = z.union([
  // Numbers
  z.literal('char'), z.literal('uint8'),
  z.literal('signed char'), z.literal('int8'),

  z.literal('unsigned short'), z.literal('uint16'),
  z.literal('short'), z.literal('int16'),

  z.literal('unsigned int'), z.literal('uint32'),
  z.literal('int'), z.literal('int32'),

  // z.literal('unsigned long'), z.literal('uint64'),
  // z.literal('long'), z.literal('int64'),

  z.literal('float'), z.literal('float32'),
  z.literal('double'), z.literal('float64'), z.literal('number'),

  // Strings
  z.literal('string'),
  // Boolean
  z.literal('bool'),
  z.literal('boolean'),
])

export const FieldSchema = z.object({
  name: StringSchema,
  type: FieldTypeSchema,
  units: StringSchema.optional(),
  note: StringSchema.optional()
})

export const FieldUnknownSchema = z.object({
  name: z.literal('unknown'),
  type: z.literal('string'),
  data: StringSchema,
})

export const ProtocolSentenceSchema = z.object({
  sentence: StringSchema,
  fields: z.array(FieldSchema),
  description: StringSchema.optional(),
})

export const VersionSchema = z.custom<`${number}.${number}.${number}`>(val => {
  const fields = z.string().parse(val).split('.')
  if (fields.length > 3) return false
  return fields.every(field => NaturalSchema.safeParse(parseInt(field)).success)
})

export const ProtocolSchema = z.object({
  protocol: StringSchema,
  version: VersionSchema.optional(),
  standard: BooleanSchema.default(false),
  sentences: z.array(ProtocolSentenceSchema)
})

export const ProtocolsFileSchema = z.object({ protocols: z.array(ProtocolSchema) })

export const ProtocolsInputSchema = z.object({
  file: StringSchema.optional(),
  content: StringSchema.optional(),
  protocols: z.array(ProtocolSchema).optional()
})

export const StoredSentenceSchema = z.object({
  sentence: StringSchema,
  protocol: z.object({
    name: StringSchema,
    standard: BooleanSchema,
    version: VersionSchema.optional(),
  }),
  fields: z.array(FieldSchema),
  description: StringSchema.optional()
})

export const StoredSentencesSchema = z.map(StringSchema, StoredSentenceSchema)

export const JSONSchemaInputSchema = z.object({
  path: StringSchema.default(__dirname),
  filename: StringSchema.default('nmea_protocols_schema.json')
})
// SENTENCES
export const NMEALikeSchema = StringSchema
  .startsWith(START_FLAG)
  .includes(SEPARATOR)
  .includes(DELIMITER)
  .endsWith(END_FLAG)

export const TalkerSchema = z.object({
  id: StringSchema,
  description: StringSchema,
})

export const NMEAUnparsedSentenceSchema = z.object({
  raw: StringSchema,
  sentence: StringSchema,
  checksum: NaturalSchema,
  data: StringArraySchema
})


export const NMEAPreParsedSentenceSchema = NMEAUnparsedSentenceSchema.extend({
  timestamp: NaturalSchema,
  talker: TalkerSchema.nullable().default(null)
})

export const DataSchema = z.union([StringSchema, NumberSchema, BooleanSchema]).nullable()

export const FieldParsedSchema = FieldSchema.extend({
  data: DataSchema
})

export const StoredSentenceDataSchema = StoredSentenceSchema.extend({
  fields: z.array(FieldParsedSchema),
  data: z.array(DataSchema)
})

export const NMEAUknownSentenceSchema = NMEAPreParsedSentenceSchema.extend({
  protocol: z.object({ name: z.literal('UNKNOWN') }),
  fields: z.array(FieldUnknownSchema),
})


export const NMEAKnownSentenceSchema = StoredSentenceDataSchema.extend({
  timestamp: NaturalSchema,
  talker: TalkerSchema.nullable().default(null),
  checksum: NaturalSchema,
  fields: z.array(FieldParsedSchema),
  data: z.array(DataSchema)
})

export const NMEASentenceSchema = z.union([NMEAKnownSentenceSchema, NMEAUknownSentenceSchema])

export const OutputSentenceSchema = StoredSentenceSchema.extend({
  talker: TalkerSchema.optional()
})