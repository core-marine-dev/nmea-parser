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

export const CODE_A = 'A'.charCodeAt(0)
export const CODE_Z = 'Z'.charCodeAt(0)
export const CODE_a = 'a'.charCodeAt(0)
export const CODE_z = 'z'.charCodeAt(0)
export const CODE_0 = '0'.charCodeAt(0)
export const CODE_9 = '9'.charCodeAt(0)

// PARSER
export const MAX_CHARACTERS = 1024
export const MAX_NMEA_CHARACTERS = 82

export const MAX_FLOAT = 999999999999999
export const MIN_FLOAT = -999999999999999