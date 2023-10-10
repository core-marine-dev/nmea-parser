// NMEA
export const START_FLAG = '$'
export const SEPARATOR = ','
export const DELIMITER = '*'
export const CHECKSUM_LENGTH = 2
export const END_FLAG = '\r\n'
export const MINIMAL_LENGTH = START_FLAG.length + DELIMITER.length + CHECKSUM_LENGTH + END_FLAG.length
