import fs from 'node:fs'
import path from 'node:path'
import { describe, test, expect } from 'vitest'
import { NMEAParser as Parser } from '../src'
import { generateSentence, getFakeSentece } from '../src/sentences'
import { NMEAKnownSentenceSchema, NMEAUknownSentenceSchema } from '../src/schemas'
import { readProtocolsFile } from '../src/protocols'
import { Protocol } from '../src/types'

const NORSUB_FILE = path.join(__dirname, 'norsub.yaml')

describe('Parser', () => {
  test('Default constructor', () => {
    const parser = new Parser()
    const parserProtocols = parser.getProtocols()
    expect(parserProtocols[0].protocol.includes('NMEA')).toBeTruthy()

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
      'NORSUB', 'NORSUB2', 'NORSUB6', 'NORSUB7', 'NORSUB7b', 'NORSUB8', //'NORSUB PRDID',
    ]
    expectedProtocols.forEach(protocol => {
      const result = parserProtocols.filter(p => p.protocol === protocol)
      if (result.length === 0) { console.log(`Protocol ${protocol} is not included`) }
      expect(result.length).toBeGreaterThan(0)
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
      'NORSUB', 'NORSUB2', 'NORSUB6', 'NORSUB7', 'NORSUB7b', 'NORSUB8', //'NORSUB PRDID',
    ]
    expectedProtocols.forEach(protocol => {
      const result = parserProtocols.filter(p => p.protocol === protocol)
      if (result.length === 0) { console.log(`Protocol ${protocol} is not included`) }
      expect(result.length).toBeGreaterThan(0)
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
      'NORSUB', 'NORSUB2', 'NORSUB6', 'NORSUB7', 'NORSUB7b', 'NORSUB8', //'NORSUB PRDID',
    ]
    expectedProtocols.forEach(protocol => {
      const result = parserProtocols.filter(p => p.protocol === protocol)
      if (result.length === 0) { console.log(`Protocol ${protocol} is not included`) }
      expect(result.length).toBeGreaterThan(0)
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
      if (output.length !== 1) { console.error(`Problem parsing frame -> ${input}`) }
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
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const aam = storedSentences['AAM']
    const gga = storedSentences['GGA']
    const input1 = getFakeSentece(generateSentence(aam), 'XXX')
    const input2 = getFakeSentece(generateSentence(gga), 'YYY');
    [input1, input2].forEach(input => {
      const output = parser.parseData(input)
      if (output.length !== 1) {
        console.error(`Problem parsing frame -> ${input}`)
        expect(output).toHaveLength(1)
      } else {
        const parsed = NMEAUknownSentenceSchema.safeParse(output[0])
        if (!parsed.success) {
          console.error(parsed.error)
        }
        expect(parsed.success).toBeTruthy()
      }
    })
  })

  test('Sentence info', () => {
    const parser = new Parser()
    // Known frame
    let sentence = parser.getSentence('AAM')
    expect(sentence?.protocol.name).toBe('NMEA')
    expect(sentence?.protocol.standard).toBeTruthy()
    expect(sentence?.talker).toBeUndefined()
    // Known talker
    sentence = parser.getSentence('GPAAM')
    expect(sentence?.protocol.name).toBe('NMEA')
    expect(sentence?.protocol.standard).toBeTruthy()
    expect(sentence?.talker?.id).toBe('GP')
    // Known special talker
    sentence = parser.getSentence('U8AAM')
    expect(sentence?.protocol.name).toBe('NMEA')
    expect(sentence?.protocol.standard).toBeTruthy()
    expect(sentence?.talker?.id).toBe('U8')
    sentence = parser.getSentence('PdfgsdfAAM')
    expect(sentence?.protocol.name).toBe('NMEA')
    expect(sentence?.protocol.standard).toBeTruthy()
    expect(sentence?.talker?.id).toBe('Pdfgsdf')
    // Unknown talker
    sentence = parser.getSentence('XXAAM')
    expect(sentence?.protocol.name).toBe('NMEA')
    expect(sentence?.protocol.standard).toBeTruthy()
    expect(sentence?.talker?.id).toBe('XX')
    expect(sentence?.talker?.description).toBe('unknown')
  })
})
