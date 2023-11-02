import { test, expect } from "vitest"
import { CHECKSUM_LENGTH, DELIMITER, END_FLAG} from '../src/constants'
import { getChecksum, numberChecksumToString, stringChecksumToNumber } from '../src/checksum'


const TEST_SENTENCES = [
  '$GPGGA,074844.199,3652.514,N,00225.679,W,1,12,1.0,0.0,M,0.0,M,,*79\r\n',
  '$GPGSA,A,3,01,02,03,04,05,06,07,08,09,10,11,12,1.0,1.0,1.0*30\r\n',
  '$GPRMC,074844.199,A,3652.514,N,00225.679,W,30386.3,045.0,021123,000.0,W*62\r\n',
  '$GPGGA,074845.199,3659.100,N,00219.087,W,1,12,1.0,0.0,M,0.0,M,,*7A\r\n',
  '$GPGSA,A,3,01,02,03,04,05,06,07,08,09,10,11,12,1.0,1.0,1.0*30\r\n',
  '$GPRMC,074845.199,A,3659.100,N,00219.087,W,30386.3,045.0,021123,000.0,W*61\r\n',
]

const EXPECTED_CHECKSUMS = [ 121, 48, 98, 122, 48, 97 ]

test('getChecksum', () => {
  TEST_SENTENCES.forEach((sentence, index) => {
    const data = sentence.slice(1, - (DELIMITER.length + CHECKSUM_LENGTH + END_FLAG.length))
    const checksum = getChecksum(data)
    expect(checksum).toBe(EXPECTED_CHECKSUMS[index])
  })
})

test('stringChecksumToNumber', () => {
  TEST_SENTENCES.forEach((sentence, index) => {
    const cs = sentence.split(DELIMITER)[1].slice(0, CHECKSUM_LENGTH)
    const checksum = stringChecksumToNumber(cs)
    expect(checksum).toBe(EXPECTED_CHECKSUMS[index])
  })
})

test('numberChecksumToString', () => {
  TEST_SENTENCES.forEach((sentence, index) => {
    const cs = sentence.split(DELIMITER)[1].slice(0, CHECKSUM_LENGTH)
    const checksum = numberChecksumToString(EXPECTED_CHECKSUMS[index])
    expect(checksum).toBe(cs)
  })
})