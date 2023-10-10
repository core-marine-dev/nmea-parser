import { z } from 'zod'
import { CHECKSUM_LENGTH, DELIMITER, END_FLAG, MINIMAL_LENGTH, START_FLAG } from './constants'
import { stringChecksumToNumber, getChecksum } from './checksum'

export const StringSchema = z.string()
export const BooleanSchema = z.boolean()
export const NumberSchema = z.number()
export const NaturalSchema = NumberSchema.int().positive()


// NMEA
export const NMEALineSchema = StringSchema.superRefine((line, ctx) => {
  if (line.length < MINIMAL_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid NMEA line -> it doesn\'t contain any data'
    })
  }
  // Check Start FLAG
  if (StringSchema.startsWith(START_FLAG).safeParse(line).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid NMEA line -> it doesn\'t start with $'
    })
  }
  // Check End Flag
  if (StringSchema.endsWith(END_FLAG).safeParse(line).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid NMEA line -> it doesn\'t end with CRLF'
    })
  }
  const frame = line.slice(1, - END_FLAG.length).split(DELIMITER)
  // Check Delimiter
  if (frame.length !== 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> it doesn't contain just one DELIMITER ${DELIMITER}`
    })
  }
  // Check Checksum length
  const [data, checksum] = frame
  if (checksum.length !== CHECKSUM_LENGTH) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> checksum has not just two characters => CHECKSUM = ${checksum}`
    })
  }
  const dataChecksumNumber = getChecksum(data)
  const checksumNumber = stringChecksumToNumber(checksum)
  if (dataChecksumNumber !== checksumNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid NMEA line -> calculated checksum ${dataChecksumNumber} != frame checksum ${checksumNumber}`
    })
  }
})

export const NMEASentenceSchema = z.object({
  emitter: StringSchema,
  fields: z.array(StringSchema),
  checksum: NumberSchema,
  sentence: StringSchema
})
