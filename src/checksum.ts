
export const getChecksum = (data: string): number => Array.from(data).reduce((acc, cur) => acc ^ cur.charCodeAt(0), 0)

export const stringChecksumToNumber = (checksum: string) => parseInt(checksum, 16)