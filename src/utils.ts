import { CODE_0, CODE_9, CODE_A, CODE_Z, CODE_a, CODE_z } from "./constants"

export const numberToHexString = (num: number) => num.toString(16)

export const isBoundedASCII = (char: string, min: number, max: number): boolean => {
  const num = char.charCodeAt(0)
  return (min <= num) && (num <= max)
}

export const isLowerCharASCII = (char: string): boolean => isBoundedASCII(char, CODE_a, CODE_z)
export const isUpperCharASCII = (char: string): boolean => isBoundedASCII(char, CODE_A, CODE_Z)
export const isNumberCharASCII = (char: string): boolean => isBoundedASCII(char, CODE_0, CODE_9)