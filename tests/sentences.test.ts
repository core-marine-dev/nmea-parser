import { describe, expect, test } from 'vitest'
import { getNumberValue } from '../src/sentences'
import { FieldType } from '../src/types'
import { IntegerSchema, NaturalSchema, NumberSchema } from '../src/schemas'

describe('getNumberValue', () => {
  const MIN_UINT8 = 0b0000_0000
  const MAX_UINT8 = 0b1111_1111
  const UINT8_LIMITS = Uint8Array.from([MIN_UINT8, MAX_UINT8])

  const MIN_INT8 = 0b1000_0000
  const MAX_INT8 = 0b0111_1111
  const INT8_LIMITS = Int8Array.from([MIN_INT8, MAX_INT8])

  const MIN_UINT16 = 0b0000_0000_0000_0000
  const MAX_UINT16 = 0b1111_1111_1111_1111
  const UINT16_LIMITS = Uint16Array.from([MIN_UINT16, MAX_UINT16])
  
  const MIN_INT16 = 0b1000_0000_0000_0000
  const MAX_INT16 = 0b0111_1111_11111111
  const INT16_LIMITS = Int16Array.from([MIN_INT16, MAX_INT16])
  
  const MIN_UINT32 = 0b0000_0000_0000_0000_0000_0000_0000_0000
  const MAX_UINT32 = 0b1111_1111_1111_1111_1111_1111_1111_1111
  const UINT32_LIMITS = Uint32Array.from([MIN_UINT32, MAX_UINT32])
  
  const MIN_INT32 = 0b1000_0000_0000_0000_0000_0000_0000_0000
  const MAX_INT32 = 0b0111_1111_1111_1111_1111_1111_1111_1111
  const INT32_LIMITS = Int32Array.from([MIN_INT32, MAX_INT32])

  const MIN_UINT64 = BigInt(0b00000000_00000000_00000000_00000000_00000000_00000000_00000000_00000000)
  const MAX_UINT64 = BigInt(0b11111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111)
  const UINT64_LIMITS = BigUint64Array.from([MIN_UINT64, MAX_UINT64])

  const MIN_INT64 = BigInt(0b10000000_00000000_00000000_00000000_00000000_00000000_00000000_00000000)
  const MAX_INT64 = BigInt(0b01111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111)
  const INT64_LIMITS =  BigInt64Array.from([MIN_INT64, MAX_INT64])

  test('invalid number type', () => {
    expect(() => getNumberValue('a' as FieldType)).toThrowError()
  })

  test('uint8', () => {
    ['uint8', 'char'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = NaturalSchema.min(UINT8_LIMITS[0]).max(UINT8_LIMITS[1]).parse(value)
      expect(value).toBe(expected)
    })
  })

  test('uint16', () => {
    ['uint16', 'unsigned short'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = NaturalSchema.min(UINT16_LIMITS[0]).max(UINT16_LIMITS[1]).parse(value)
      expect(value).toBe(expected)
    })
  })

  test('uint32', () => {
    ['uint32', 'unsigned int'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = NaturalSchema.min(UINT32_LIMITS[0]).max(UINT32_LIMITS[1]).parse(value)
      expect(value).toBe(expected)
    })
  })

  test('uint64', () => {
    ['uint64', 'unsigned long'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      // const bigValue = BigInt(value as number)
      // const bigExpected = NaturalSchema.min(Number(UINT64_LIMITS[0])).max(Number(UINT64_LIMITS[1])).parse(bigValue)
      // const expected = Number(bigExpected)
      const expected = NaturalSchema.parse(value)
      expect(value).toBe(expected)
    })
  })

  test('int8', () => {
    ['int8', 'signed char'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.min(INT8_LIMITS[0]).max(INT8_LIMITS[1]).parse(value)
      expect(value).toBe(expected)
    })
  })

  test('int16', () => {
    ['int16', 'short'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.min(INT16_LIMITS[0]).max(INT16_LIMITS[1]).parse(value)
      expect(value).toBe(expected)
    })
  })

  test('int32', () => {
    ['int32', 'int'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      const expected = IntegerSchema.min(INT32_LIMITS[0]).max(INT32_LIMITS[1]).parse(value)
      expect(value).toBe(expected)
    })
  })

  test('int64', () => {
    ['int64', 'long'].forEach(type => {
      const value = getNumberValue(type as FieldType)
      // const bigValue = BigInt(value as number)
      // const bigExpected = IntegerSchema.min(Number(INT64_LIMITS[0])).max(Number(INT64_LIMITS[1])).parse(bigValue)
      // const expected = Number(bigExpected)
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