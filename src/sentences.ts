import { getChecksum, numberChecksumToString } from "./checksum";
import { Data, FieldType, NMEALike, StoredSentence } from "./types";


export const getNumberValue = (type: FieldType): Data => {
  const seed = Math.random() * Math.pow(10, 10)
  const float32Seed = Math.random() * (Math.pow(2, 23) / 10)
  const float64Seed = Math.random() * (Number.MAX_SAFE_INTEGER - 1)
  switch (type) {
    case 'uint8':
    case 'char':
      return (new Uint8Array([seed]))[0]

    case 'int8':
    case 'signed char':
      return (new Int8Array([seed]))[0]

    case 'uint16':
    case 'unsigned short':
      return (new Uint16Array([seed]))[0]

    case 'int16':
    case 'short':
      return (new Int16Array([seed]))[0]

    case 'uint32':
    case 'unsigned int':
      return (new Uint32Array([seed]))[0]

    case 'int32':
    case 'int':
      return (new Int32Array([seed]))[0]

    case 'uint64':
    case 'unsigned long':
      return Number((new BigUint64Array([BigInt(Math.floor(seed))]))[0])
        
    case 'int64':
    case 'long':
      return Number((new BigInt64Array([BigInt(Math.floor(seed))]))[0])

    case 'float32':
    case 'float':
      return (new Float32Array([float32Seed]))[0]

    case 'float64':
    case 'double':
        return (new Float64Array([float64Seed]))[0]
  }
  throw Error('invalid type')
}

export const getValue = (type: FieldType): Data => {
  switch (type) {
    case 'bool':
    case 'boolean':
      return Math.random() > 0.5
    case 'string':
      return Math.random().toString(36).substring(2)
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
