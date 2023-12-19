
export const getChecksum = (data: string): number => Array.from(data).reduce((acc, cur) => acc ^ cur.charCodeAt(0), 0)

export const stringChecksumToNumber = (checksum: string): number => parseInt(checksum, 16)

export const numberChecksumToString = (checksum: number): string => {
  const num0 = checksum & 0b0000_1111
  const num1 = (checksum & 0b1111_0000) >>> 4
  const char0 = num0.toString(16).toUpperCase()
  const char1 = num1.toString(16).toUpperCase()
  return `${char1}${char0}`
}