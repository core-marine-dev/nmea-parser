import { CODE_0, CODE_9, CODE_A, CODE_Z, CODE_a, CODE_z, TALKERS, TALKERS_SPECIAL } from "./constants"
import { Talker } from "./types"

export const numberToHexString = (num: number) => num.toString(16)

export const isBoundedASCII = (char: string, min: number, max: number): boolean => {
  const num = char.charCodeAt(0)
  return (min <= num) && (num <= max)
}

export const isLowerCharASCII = (char: string): boolean => isBoundedASCII(char, CODE_a, CODE_z)
export const isUpperCharASCII = (char: string): boolean => isBoundedASCII(char, CODE_A, CODE_Z)
export const isNumberCharASCII = (char: string): boolean => isBoundedASCII(char, CODE_0, CODE_9)

export const getTalker = (id: string): Talker => {
  // Known Talker
  const description = TALKERS.get(id)
  if (description) { return { id, description } }
  // Special Talker U#
  if (id.startsWith('U') && id.length === 2 && !isNaN(Number(id[1]))) {
    return { id, description: TALKERS_SPECIAL['U'] }
  }
  // Special Talker Pxxx -> Propietary
  if (id.startsWith('P')) {
    return { id, description: TALKERS_SPECIAL['P'] }
  }
  // Uknown talker
  return { id, description: 'unknown' }
}