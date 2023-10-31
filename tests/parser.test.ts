import { describe, test, expect } from 'vitest'
import { Parser } from '../src/parser'

describe('Parser', () => {
  test('Default constructor', () => {
    const parser = new Parser()
    const expectedProtocols = ['NMEA', 'GYROCOMPAS1', 'NORSUB8']
    const parserProtocols = parser.getProtocols()
    expectedProtocols.forEach(protocol => expect(parserProtocols.includes(protocol)).toBeTruthy())

    const expectedSentences = ['HEHDT', 'PHTRO', 'PHINF']
    const parserSentences = parser.getSentences()
    expectedSentences.forEach(sentence => expect(parserSentences.includes(sentence)).toBeTruthy())
  })
})