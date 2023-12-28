import { getChecksum, numberChecksumToString, stringChecksumToNumber } from "./checksum";
import { CHECKSUM_LENGTH, DELIMITER, END_FLAG, END_FLAG_LENGTH, MINIMAL_LENGTH, SEPARATOR, START_FLAG, START_FLAG_LENGTH } from "./constants";
import { NMEALikeSchema, NMEAUknownSentenceSchema, NMEAUnparsedSentenceSchema } from "./schemas";
import { Data, FieldType, FieldUnknown, NMEALike, NMEAPreParsed, NMEAUknownSentence, NMEAUnparsedSentence, StoredSentence } from "./types";
import { isLowerCharASCII, isNumberCharASCII, isUpperCharASCII } from "./utils";
// GET NMEA SENTENCE
export const isNMEAFrame = (text: string): boolean => {
  // Not valid NMEA like
  const parsed = NMEALikeSchema.safeParse(text)
  if (!parsed.success) {
    console.debug(`Error parsing frame -> ${parsed.error.message}`)
    return false
  }
  // More than one START Flag
  if (text.lastIndexOf(START_FLAG) > 0) {
    console.debug(`Invalid NMEA line -> it contains more than one ${START_FLAG} symbol -> ${text}`)
    return false
  }
  // Not enough characters
  const { data } = parsed
  if (data.length < MINIMAL_LENGTH) {
    console.debug('Invalid NMEA line -> it doesn\'t contain any data')
    return false
  }
  // Not one DELIMITER
  const frameParts = data.slice(START_FLAG_LENGTH, - END_FLAG_LENGTH).split(DELIMITER)
  if (frameParts.length !== 2) {
    console.debug(`Invalid NMEA line -> it doesn't contain just one DELIMITER ${DELIMITER}`)
    return false
  }
  // Check checksum length and value
  const [frame, checksum] = frameParts
  if (checksum.length !== CHECKSUM_LENGTH) {
    console.debug(`Invalid NMEA line -> checksum has not just two characters => CHECKSUM = ${checksum}`)
    return false
  }
  const frameChecksumNumber = getChecksum(frame)
  const checksumNumber = stringChecksumToNumber(checksum)
  if (frameChecksumNumber !== checksumNumber) {
    console.debug(`Invalid NMEA line -> calculated checksum ${frameChecksumNumber} != frame checksum ${checksumNumber}`)
    return false
  }
  return true
}

export const getNMEAUnparsedSentence = (text: string): NMEAUnparsedSentence | null => {
  if (!isNMEAFrame(text)) return null
  const raw = text
  const [info, cs] = raw.slice(1, -END_FLAG_LENGTH).split(DELIMITER)
  const checksum = stringChecksumToNumber(cs)
  const [sentence, ...data] = info.split(SEPARATOR)
  const parsed =  NMEAUnparsedSentenceSchema.safeParse({ raw, sentence, checksum, data })
  if (parsed.success) { return parsed.data }
  console.debug(`Error parsing sentence -> ${raw}`)
  console.debug(parsed.error)
  return null
}

export const getUnknownSentence = (sentence: NMEAPreParsed): NMEAUknownSentence => {
  const fields: FieldUnknown[] = sentence.data.map(value => ({ name: 'unknown', type: 'string', data: value }))
  const unknowFrame = {...sentence, protocol: { name: 'UNKNOWN' }, fields }
  const parsed = NMEAUknownSentenceSchema.safeParse(unknowFrame)
  if (parsed.success) return parsed.data
  throw new Error(parsed.error.message)
}

// TESTING - GENERATE
export const getNumberValue = (type: FieldType): Data => {
  const sign = ((Math.random() < 0.5) ? -1: 1)
  const useed = Math.round( Math.random() * (Number.MAX_SAFE_INTEGER - Number.MIN_SAFE_INTEGER) + Number.MIN_SAFE_INTEGER )
  const seed = useed * sign
  const fseed = Math.random() * sign
  switch (type) {
    case 'uint8':
    case 'char':
      return (new Uint8Array([useed]))[0]

    case 'uint16':
    case 'unsigned short':
      return (new Uint16Array([useed]))[0]

    case 'uint32':
    case 'unsigned int':
      return (new Uint32Array([useed]))[0]

    // case 'uint64':
    // case 'unsigned long':
    //   return Number((new BigUint64Array([BigInt(Math.floor(seed))]))[0])

    case 'int8':
    case 'signed char':
      return (new Int8Array([seed]))[0]

    case 'int16':
    case 'short':
      return (new Int16Array([seed]))[0]

    case 'int32':
    case 'int':
      return (new Int32Array([seed]))[0]

    // case 'int64':
    // case 'long':
    //   return Number((new BigInt64Array([BigInt(Math.floor(seed))]))[0])

    case 'float32':
    case 'float':
      return (new Float32Array([fseed]))[0]
      
    case 'float64':
    case 'double':
    case 'number':
      return (new Float64Array([fseed]))[0]
  }
  throw Error('invalid type')
}

export const getStringValue = (): string => {
  const text = Buffer.from(Math.random().toString(36).substring(2)).toString('ascii')
  const array = Array.from(text).map(letter => {
    if (isLowerCharASCII(letter) || isUpperCharASCII(letter) || isNumberCharASCII(letter)) { return letter }
    return 'a'
  })
  return array.join('')
}

export const getValue = (type: FieldType): Data => {
  switch (type) {
    case 'bool':
    case 'boolean':
      return Math.random() > 0.5
    case 'string':
      return getStringValue()
  }
  return getNumberValue(type)
}

export const generateSentence = (model: StoredSentence): NMEALike => {
  let sentence = `$${model.sentence}`
  model.fields.forEach(field => {
    const value = getValue(field.type)
    sentence += `,${value}`
  })
  const cs = getChecksum(sentence.slice(1))
  const checksum = numberChecksumToString(cs)
  sentence += `*${checksum}\r\n`
  return sentence
}

export const getFakeSentece = (text: string, sentence: string): string => {
  const [frame, _cs] = text.slice(START_FLAG_LENGTH, -END_FLAG_LENGTH).split(DELIMITER)
  const [_emitter, ...info] = frame.split(SEPARATOR)
  const newFrame = [sentence, ...info].join(SEPARATOR)
  const checksum = numberChecksumToString(getChecksum(newFrame))
  return `$${newFrame}${DELIMITER}${checksum}${END_FLAG}`
}