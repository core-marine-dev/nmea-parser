// NMEA
export const START_FLAG = '$'
export const SEPARATOR = ','
export const DELIMITER = '*'
export const END_FLAG = '\r\n'

export const START_FLAG_LENGTH = START_FLAG.length
export const SEPARATOR_LENGTH = SEPARATOR.length
export const DELIMITER_LENGTH = DELIMITER.length
export const CHECKSUM_LENGTH = 2
export const END_FLAG_LENGTH = END_FLAG.length
export const MINIMAL_LENGTH = START_FLAG_LENGTH + DELIMITER_LENGTH + CHECKSUM_LENGTH + END_FLAG_LENGTH

// GENERATE ASCII STRING
export const CODE_A = 'A'.charCodeAt(0)
export const CODE_Z = 'Z'.charCodeAt(0)
export const CODE_a = 'a'.charCodeAt(0)
export const CODE_z = 'z'.charCodeAt(0)
export const CODE_0 = '0'.charCodeAt(0)
export const CODE_9 = '9'.charCodeAt(0)

// GENERATE NUMBERS
export const UINT8_MAX = Uint8Array.from([0b1111_1111])[0]
export const UINT16_MAX = Uint16Array.from([0b1111_1111_1111_1111])[0]
export const UINT32_MAX = Uint32Array.from([0b1111_1111_1111_1111_1111_1111_1111_1111])[0]
// export const UINT64_MAX = Uint64Array.from([0b11111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111])[0]

export const [INT8_MIN, INT8_MAX] = Int8Array.from([0b1000_0000, 0b0111_1111])
export const [INT16_MIN, INT16_MAX] = Int16Array.from([0b1000_0000_0000_0000, 0b0111_1111_1111_1111])
export const [INT32_MIN, INT32_MAX] = Int32Array.from([0b1000_0000_0000_0000_0000_0000_0000_0000, 0b0111_1111_1111_1111_1111_1111_1111_1111])
// export const [INT64_MIN, INT64_MAX] = Int64Array.from([0b10000000_00000000_00000000_00000000_00000000_00000000_00000000_00000000, 0b01111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111])

export const MAX_FLOAT = 999999999999999
export const MIN_FLOAT = -999999999999999

// PARSER
export const MAX_CHARACTERS = 1024
export const MAX_NMEA_CHARACTERS = 82
