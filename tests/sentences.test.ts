import { describe, expect, test } from 'vitest'
import { getNumberValue, getValue } from '../src/sentences'
import { FieldType } from '../src/types'
import { Int16Schema, Int32Schema, Int8Schema, IntegerSchema, NaturalSchema, Uint16Schema, Uint32Schema, Uint8Schema } from '../src/schemas'

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

  test('int64', () => {
    ['int64', 'long'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.parse(value)
      expect(value).toBe(expected)
    })

  })

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
      const expected = IntegerSchema.safeParse(value)
      expect(expected.success).toBeFalsy()
    })
  })

  test('Invalid type', () => {
    expect(() => getValue('sstring' as FieldType)).toThrowError()
  })
})

describe.skip('generateSentence', () => {
  test('')
})