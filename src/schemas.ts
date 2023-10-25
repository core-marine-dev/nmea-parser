import { z } from 'zod'
import { CHECKSUM_LENGTH, DELIMITER, END_FLAG, MINIMAL_LENGTH, SEPARATOR, START_FLAG } from './constants'
import { stringChecksumToNumber, getChecksum } from './checksum'

export const StringSchema = z.string()
export const StringArraySchema = z.array(StringSchema)
export const BooleanSchema = z.boolean()
export const NumberSchema = z.number()
export const NaturalSchema = NumberSchema.int().positive()


// NMEA
export const NMEASentenceSchema = z.object({
  frame: StringSchema,
  emitter: StringSchema,
  fields: z.array(StringSchema),
  checksum: NumberSchema,
})

export const NMEALineSchema = StringSchema.superRefine((line, ctx) => {
  if (line.length < MINIMAL_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid NMEA line -> it doesn\'t contain any data'
    })
    return
  }
  // Check Start FLAG
  if (!StringSchema.startsWith(START_FLAG).safeParse(line).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid NMEA line -> it doesn\'t start with $'
    })
    return
  }
  // Check End Flag
  if (!StringSchema.endsWith(END_FLAG).safeParse(line).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid NMEA line -> it doesn\'t end with CRLF'
    })
    return
  }
  const frame = line.slice(1, - END_FLAG.length).split(DELIMITER)
  // Check Delimiter
  if (frame.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> it doesn't contain just one DELIMITER ${DELIMITER}`
    })
    return
  }
  // Check Checksum length
  const [data, checksum] = frame
  if (checksum.length !== CHECKSUM_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> checksum has not just two characters => CHECKSUM = ${checksum}`
    })
    return
  }
  const dataChecksumNumber = getChecksum(data)
  const checksumNumber = stringChecksumToNumber(checksum)
  if (dataChecksumNumber !== checksumNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> calculated checksum ${dataChecksumNumber} != frame checksum ${checksumNumber}`
    })
    return
  }
  if (data.indexOf(SEPARATOR) === -1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> does not include any field (no ${SEPARATOR} in the frame)`
    })
  }
}).transform(line => {
  const frame = line.slice(START_FLAG.length, - END_FLAG.length)
  const [data, cs] = frame.split(DELIMITER)
  const checksum = stringChecksumToNumber(cs)
  const [emitter, ...fields] = data.split(SEPARATOR)
  return NMEASentenceSchema.parse({ frame, emitter, fields, checksum })
})

// PROTOCOLS
export const FieldTypeSchema = z.union([
  // Numbers
  z.literal('char'), z.literal('uint8'),
  z.literal('signed char'), z.literal('int8'),

  z.literal('unsigned short'), z.literal('uint16'),
  z.literal('short'), z.literal('int16'),

  z.literal('unsigned int'), z.literal('uint32'),
  z.literal('int'), z.literal('int32'),

  z.literal('unsigned long'), z.literal('uint64'),
  z.literal('long'), z.literal('int64'),

  z.literal('float'), z.literal('float32'),
  z.literal('double'), z.literal('float64'),

  z.literal('number'),
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

export const JSONSchemaInputSchema = z.object({
  path: StringSchema.default(__dirname),
  filename: StringSchema.default('nmea_protocols_schema.json')
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
