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

// PARSER
export const MAX_CHARACTERS = 1024
export const MAX_NMEA_CHARACTERS = 82