import fs from 'node:fs'
import path from 'node:path'
import { describe, test, expect } from 'vitest'
import { Parser } from '../src/parser'
import { generateSentence } from '../src/sentences'
import { NMEAKnownSentenceSchema, NMEAUknownSentenceSchema } from '../src/schemas'
import { DELIMITER, END_FLAG, END_FLAG_LENGTH, SEPARATOR, START_FLAG_LENGTH } from '../src/constants'
import { getChecksum, numberChecksumToString } from '../src/checksum'
import { readProtocolsFile, readProtocolsString } from '../src/protocols'
import { Protocol, ProtocolsFile } from '../src/types'

const NORSUB_FILE = path.join(__dirname, 'norsub.yaml')

describe('Parser', () => {
  test('Default constructor', () => {
    const parser = new Parser()
    const parserProtocols = parser.getProtocols()
    expect(parserProtocols.includes('NMEA')).toBeTruthy()

    const parserSentences = parser.getSentences()
    const expectedSentences = ['AAM', 'GGA']
    expectedSentences.forEach(sentence => expect(Object.keys(parserSentences).includes(sentence)).toBeTruthy())
  })
  
  test('Add protocols with file', () => {
    const file = NORSUB_FILE
    const parser = new Parser()
    parser.addProtocols({ file })

    const parserProtocols = parser.getProtocols()
    
    const expectedProtocols = [
      'NMEA',
      'GYROCOMPAS1', 'Tokimek PTVG', 'RDI ADCP', 'SMCA', 'SMCC',
      'NORSUB', 'NORSUB2', 'NORSUB6', 'NORSUB7', 'NORSUB7b', 'NORSUB8', 'NORSUB PRDID',
    ]
    expectedProtocols.forEach(protocol => {
      const result = parserProtocols.includes(protocol)
      if (!result) { console.log(`Protocol ${protocol} is not included`) }
      expect(result).toBeTruthy()
    })
  
    const parserSentences = parser.getSentences()
    const expectedSentences = [
      'AAM', 'GGA',
      'HEHDT', 'PHTRO', 'PHINF',
      'PNORSUB', 'PNORSUB2', 'PNORSUB6', 'PNORSUB7', 'PNORSUB7b', 'PNORSUB8', 'PRDID',
      'PTVG', 'PRDID', 'PSMCA', 'PSMCC',
    ]
    expectedSentences.forEach(sentence => {
      const result = Object.keys(parserSentences).includes(sentence)
      if (!result) { console.log(`Sentence ${sentence} is not included`) }
      expect(result).toBeTruthy()
    })
  })
  
  test('Add protocols with content', () => {
    const content = fs.readFileSync(NORSUB_FILE, 'utf-8')
    const parser = new Parser()
    parser.addProtocols({ content })

    const parserProtocols = parser.getProtocols()
    
    const expectedProtocols = [
      'NMEA',
      'GYROCOMPAS1', 'Tokimek PTVG', 'RDI ADCP', 'SMCA', 'SMCC',
      'NORSUB', 'NORSUB2', 'NORSUB6', 'NORSUB7', 'NORSUB7b', 'NORSUB8', 'NORSUB PRDID',
    ]
    expectedProtocols.forEach(protocol => {
      const result = parserProtocols.includes(protocol)
      if (!result) { console.log(`Protocol ${protocol} is not included`) }
      expect(result).toBeTruthy()
    })
  
    const parserSentences = parser.getSentences()
    const expectedSentences = [
      'AAM', 'GGA',
      'HEHDT', 'PHTRO', 'PHINF',
      'PNORSUB', 'PNORSUB2', 'PNORSUB6', 'PNORSUB7', 'PNORSUB7b', 'PNORSUB8', 'PRDID',
      'PTVG', 'PRDID', 'PSMCA', 'PSMCC',
    ]
    expectedSentences.forEach(sentence => {
      const result = Object.keys(parserSentences).includes(sentence)
      if (!result) { console.log(`Sentence ${sentence} is not included`) }
      expect(result).toBeTruthy()
    })
  })
  
  test('Add protocols with protocols', () => {
    const { protocols } = readProtocolsFile(NORSUB_FILE)
    const parser = new Parser()
    parser.addProtocols({ protocols })

    const parserProtocols = parser.getProtocols()
    
    const expectedProtocols = [
      'NMEA',
      'GYROCOMPAS1', 'Tokimek PTVG', 'RDI ADCP', 'SMCA', 'SMCC',
      'NORSUB', 'NORSUB2', 'NORSUB6', 'NORSUB7', 'NORSUB7b', 'NORSUB8', 'NORSUB PRDID',
    ]
    expectedProtocols.forEach(protocol => {
      const result = parserProtocols.includes(protocol)
      if (!result) { console.log(`Protocol ${protocol} is not included`) }
      expect(result).toBeTruthy()
    })
  
    const parserSentences = parser.getSentences()
    const expectedSentences = [
      'AAM', 'GGA',
      'HEHDT', 'PHTRO', 'PHINF',
      'PNORSUB', 'PNORSUB2', 'PNORSUB6', 'PNORSUB7', 'PNORSUB7b', 'PNORSUB8', 'PRDID',
      'PTVG', 'PRDID', 'PSMCA', 'PSMCC',
    ]
    expectedSentences.forEach(sentence => {
      const result = Object.keys(parserSentences).includes(sentence)
      if (!result) { console.log(`Sentence ${sentence} is not included`) }
      expect(result).toBeTruthy()
    })
  })

  test('Add protocols error', () => {
    const parser = new Parser()
    expect(() => parser.addProtocols({})).toThrow()
    expect(() => parser.addProtocols({ file: '' })).toThrow()
    expect(() => parser.addProtocols({ content: '' })).toThrow()
    expect(() => parser.addProtocols({ protocols: {} as Protocol[] })).toThrow()
  })

  test('Parsing NMEA + NorSub sentences', () => {
    const parser = new Parser()
    parser.addProtocols({ file: NORSUB_FILE })
    const storedSentences = parser.getSentences()
    Object.values(storedSentences).forEach(storedSentence => {
      const input = generateSentence(storedSentence)
      expect(input).toBeTypeOf('string')
      const output = parser.parseData(input)[0]
      const parsed = NMEAKnownSentenceSchema.safeParse(output)
      if (!parsed.success) {
        console.error(parsed.error)
      }
      expect(parsed.success).toBeTruthy()
    })
  })

  test('Uncompleted frames WITHOUT memory', () => {
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const input1 = generateSentence(storedSentences['AAM'])
    const halfInput1 = input1.slice(0, 10)
    const halfInput2 = input1.slice(10)
    const input2 = generateSentence(storedSentences['GGA']);
    [
      halfInput1 + input2,
      halfInput1 + halfInput1+ input2,
      input2 + halfInput2,
      input2 + halfInput2 + halfInput2,
      'asdfasfaf' + input2 + 'lakjs'
    ].forEach(input => {
      const output = parser.parseData(input)
      expect(output).toHaveLength(1)
    })
  })

  test('Uncompleted frames WITH memory', () => {
    const parser = new Parser()
    parser.memory = true
    const storedSentences = parser.getSentences()
    const input1 = generateSentence(storedSentences['AAM'])
    const halfInput1 = input1.slice(0, 10)
    const halfInput2 = input1.slice(10)
    const input2 = generateSentence(storedSentences['GGA']);
    [
      halfInput1 + input2,
      halfInput1 + halfInput1+ input2,
      input2 + halfInput2,
      input2 + halfInput2 + halfInput2,
      'asdfasfaf' + input2 + 'lakjs'
    ].forEach(input => {
      const output = parser.parseData(input)
      expect(output).toHaveLength(1)
    })
    parser.parseData(halfInput1)
    const mem = parser.parseData(halfInput2)
    expect(mem).toHaveLength(1)
  })

  test('Unknown frames', () => {
    const getFakeSentece = (text: string, sentence: string): string => {
      const [frame, _cs] = text.slice(START_FLAG_LENGTH, -END_FLAG_LENGTH).split(DELIMITER)
      const [_emitter, ...info] = frame.split(SEPARATOR)
      const newFrame = [sentence, ...info].join(SEPARATOR)
      const checksum = numberChecksumToString(getChecksum(newFrame))
      return `$${newFrame}${DELIMITER}${checksum}${END_FLAG}`
    }

    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const aam = storedSentences['AAM']
    const gga = storedSentences['GGA']
    const input1 = getFakeSentece(generateSentence(aam), 'XXX')
    const input2 = getFakeSentece(generateSentence(gga), 'YYY');
    [input1, input2].forEach(input => {
      const output = parser.parseData(input)[0]
      const parsed = NMEAUknownSentenceSchema.safeParse(output)
      if (!parsed.success) {
        console.error(parsed.error)
      }
      expect(parsed.success).toBeTruthy()
    })
  })
})
