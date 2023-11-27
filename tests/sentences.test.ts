import { describe, expect, test } from 'vitest'
import { generateSentence, getNMEAUnparsedSentence, getNumberValue, getUnknownSentence, getValue } from '../src/sentences'
import { FieldType, NMEAPreParsed, NMEAUnparsedSentence, StoredSentence } from '../src/types'
import { Int16Schema, Int32Schema, Int8Schema, IntegerSchema, NMEALikeSchema, NMEAPreParsedSentenceSchema, NMEAUnparsedSentenceSchema, NaturalSchema, Uint16Schema, Uint32Schema, Uint8Schema } from '../src/schemas'
import { CHECKSUM_LENGTH, DELIMITER_LENGTH, END_FLAG_LENGTH, SEPARATOR, START_FLAG_LENGTH } from '../src/constants'

describe('getNumberValue', () => {

  test('invalid number type', () => {
    expect(() => getNumberValue('a' as FieldType)).toThrowError()
  })

  test('uint8', () => {
    ['uint8', 'char'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = Uint8Schema.parse(value)
      expect(value).toBe(expected)
    })
  })

  test('uint16', () => {
    ['uint16', 'unsigned short'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = Uint16Schema.parse(value)
      expect(value).toBe(expected)
    })
  })

  test('uint32', () => {
    ['uint32', 'unsigned int'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = Uint32Schema.parse(value)
      expect(value).toBe(expected)
    })
  })

  // test('uint64', () => {
  //   ['uint64', 'unsigned long'].forEach(type => {
  //     const value = getNumberValue(type as FieldType)
  //     const expected = NaturalSchema.parse(value)
  //     expect(value).toBe(expected)
  //   })
  // })

  test('int8', () => {
    ['int8', 'signed char'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = Int8Schema.parse(value)
      expect(value).toBe(expected)
    })
  })

  test('int16', () => {
    ['int16', 'short'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = Int16Schema.parse(value)
      expect(value).toBe(expected)
    })
  })

  test('int32', () => {
    ['int32', 'int'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = Int32Schema.parse(value)
      expect(value).toBe(expected)
    })
  })

  // test('int64', () => {
  //   ['int64', 'long'].forEach(type => {
  //     const value = getNumberValue(type as FieldType)
  //     const expected = IntegerSchema.parse(value)
  //     expect(value).toBe(expected)
  //   })
  // })

  test('float32', () => {
    ['float32', 'float'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.safeParse(value).success
      expect(expected).toBeFalsy()
    })
  })

  test('float64', () => {
    ['float64', 'double'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.safeParse(value).success
      if (!expected) { console.log(`Value -> ${value}`)}
      expect(expected).toBeFalsy()
    })
  })
})

describe('getValue', () => {
  test('boolean', () => {
    ['bool', 'boolean'].forEach(type => {
      const value = getValue(type as FieldType)
      expect(typeof value === 'boolean').toBeTruthy()
    })
  })

  test('string', () => {
    const value = getValue('string')
    expect(typeof value === 'string').toBeTruthy()
  })

  test('numbers', () => {
    ['uint8', 'uint16', 'uint32'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = NaturalSchema.parse(value)
      expect(value).toBe(expected)
    });

    ['int8', 'int16', 'int32'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.parse(value)
      expect(value).toBe(expected)
    });

    ['float32', 'float64'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.safeParse(value).success
      if (expected) { console.log(`Value -> ${value}`) }
      expect(expected).toBeFalsy()
    })
  })

  test('Invalid type', () => {
    expect(() => getValue('sstring' as FieldType)).toThrowError()
  })
})

describe('generateSentence', () => {
  const testSentence: StoredSentence = {
    sentence: 'TEST',
    protocol: {
      name: 'TESTING PROTOCOL',
      standard: false,
      version: '1.2.3'
    },
    fields: [
      { name: 'latitude', type: 'number', units: 'deg' },
      { name: 'longitude', type: 'float32', units: 'deg' },
      { name: 'altitude', type: 'float64', units: 'm' },
      { name: 'a', type: 'int8'},
      { name: 'b', type: 'int16'},
      { name: 'c', type: 'int32'},
      { name: 'd', type: 'uint8'},
      { name: 'e', type: 'uint16'},
      { name: 'f', type: 'uint32'},
      { name: 'g', type: 'boolean'},
      { name: 'h', type: 'string'},
    ],
    description: 'This is just an invented sentence for testing'
  }
  test('Happy path', () => {
    const expected = generateSentence(testSentence)
    const parsed = NMEALikeSchema.parse(expected)
    expect(parsed).toBe(expected)

    const info = parsed.slice(1, - (DELIMITER_LENGTH + CHECKSUM_LENGTH + END_FLAG_LENGTH)).split(SEPARATOR)
    const field0 = info[0]
    const field1 = Number(info[1])
    const field2 = Number(info[2])
    const field3 = Number(info[3])
    const field4 = Number(info[4])
    const field5 = Number(info[5])
    const field6 = Number(info[6])
    const field7 = Number(info[7])
    const field8 = Number(info[8])
    const field9 = Number(info[9])
    const field10 = Boolean(info[10])
    const field11 = info[11]
    
    expect(field0).toBe('TEST')
    const rest1 = Float64Array.from([field1])[0] - field1;
    const rest2 = Float32Array.from([field2])[0] - field2;
    const rest3 = Float64Array.from([field3])[0] - field3;
    [rest1, rest2, rest3].forEach(rest => {
      expect(rest).toBeLessThan(0.1)
    })
    expect(Int8Array.from([field4])[0]).toBe(field4)
    expect(Int16Array.from([field5])[0]).toBe(field5)
    expect(Int32Array.from([field6])[0]).toBe(field6)
    expect(Uint8Array.from([field7])[0]).toBe(field7)
    expect(Uint16Array.from([field8])[0]).toBe(field8)
    expect(Uint32Array.from([field9])[0]).toBe(field9)
    expect(field10).toBeTypeOf('boolean')
    expect(field11).toBeTypeOf('string')
  })
})

describe.skip('unknown sentence', () => {
  const testSentence: StoredSentence = {
    sentence: 'TEST',
    protocol: {
      name: 'TESTING PROTOCOL',
      standard: false,
      version: '1.2.3'
    },
    fields: [
      { name: 'latitude', type: 'number', units: 'deg' },
      { name: 'longitude', type: 'float32', units: 'deg' },
      { name: 'altitude', type: 'float64', units: 'm' },
      { name: 'a', type: 'int8'},
      { name: 'b', type: 'int16'},
      { name: 'c', type: 'int32'},
      { name: 'd', type: 'uint8'},
      { name: 'e', type: 'uint16'},
      { name: 'f', type: 'uint32'},
      { name: 'g', type: 'boolean'},
      { name: 'h', type: 'string'},
    ],
    description: 'This is just an invented sentence for testing'
  }
  test('getUnknownSentence', () => {
    const text = generateSentence(testSentence)
    const unparsedSentence: NMEAUnparsedSentence = getNMEAUnparsedSentence(text) as NMEAUnparsedSentence
    const preparsedFrame = { timestamp: Date.now(), ...unparsedSentence }
    const input: NMEAPreParsed = NMEAPreParsedSentenceSchema.parse(preparsedFrame)
    const result = getUnknownSentence(input)
    expect(result.protocol.name).toBe('UNKNOWN')
    expect(result.raw).toBe(text)

  })
})