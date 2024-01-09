import fs from 'node:fs'
import path from 'node:path'
import { describe, test, expect } from 'vitest'
import { Parser } from '../src/parser'
import { generateSentenceFromModel, getFakeSentence } from '../src/sentences'
import { NMEAKnownSentenceSchema, NMEASentenceSchema, NMEAUknownSentenceSchema } from '../src/schemas'
import { TALKERS, TALKERS_SPECIAL } from '../src/constants'
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
      const input = generateSentenceFromModel(storedSentence)
      expect(input).toBeTypeOf('string')
      const output = parser.parseData(input)[0]
      const parsed = NMEAKnownSentenceSchema.safeParse(output)
      if (!parsed.success) {
        console.error(parsed.error)
      }
      expect(parsed.success).toBeTruthy()
    })
  })

  test('Parsing sentences with known regular talkers', () => {
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const aam = storedSentences['AAM']
    const gga = storedSentences['GGA']
    const inputAAM = getFakeSentence(generateSentenceFromModel(aam), 'GPAAM')
    const inputGGA = getFakeSentence(generateSentenceFromModel(gga), 'GAGGA');
    const input = inputAAM + inputGGA
    const output = parser.parseData(input);
    expect(output).toHaveLength(2)
    if (output.length === 2) {
      // Known talker
      ['GP', 'GA'].forEach((id, index) => {
        const parse = NMEASentenceSchema.safeParse(output[index])
        if (!parse.success) { console.error(parse.error ) }
        expect(parse.success).toBeTruthy()
        // @ts-ignore
        const { data } = parse
        expect(data.talker).toEqual({ id, description: TALKERS.get(id)})
      })
    }
  })

  test('Parsing sentences with known special talkers', () => {
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const talkerU = 'U8'
    const talkerP = 'PASDF'
    const aam = storedSentences['AAM']
    const gga = storedSentences['GGA']
    const inputAAM = getFakeSentence(generateSentenceFromModel(aam), talkerU + 'AAM')
    const inputGGA = getFakeSentence(generateSentenceFromModel(gga), talkerP + 'GGA');
    const input = inputAAM + inputGGA
    const output = parser.parseData(input);
    if (output.length !== 2) {
      console.error(`Problem parsing input\n${input}}`)
      console.error(`Output should have length 2 instead of ${output.length}`)
      console.error(output)
      expect(output).toHaveLength(2)
    } else {
      output.forEach(out => {
        const parse = NMEASentenceSchema.safeParse(out)
        if (!parse.success) { console.error(parse.error ) }
        expect(parse.success).toBeTruthy()
      })
      // Known special talker
      const [outputU, outputP] = [output[0].talker, output[1].talker]
      // @ts-ignore
      expect(outputU).toEqual({ id: talkerU, description: TALKERS_SPECIAL['U']})
      expect(outputP).toEqual({ id: talkerP, description: TALKERS_SPECIAL['P']})
    }
  })

  test('Parsing sentences with unknown talkers', () => {
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const talkerXX = 'XX'
    const talkerUU = 'UU'
    const aam = storedSentences['AAM']
    const gga = storedSentences['GGA']
    const inputAAM = getFakeSentence(generateSentenceFromModel(aam), talkerXX + 'AAM')
    const inputGGA = getFakeSentence(generateSentenceFromModel(gga), talkerUU + 'GGA');
    const input = inputAAM + inputGGA
    const output = parser.parseData(input);
    expect(output).toHaveLength(2)
    output.forEach(out => {
      const parse = NMEASentenceSchema.safeParse(out)
      if (!parse.success) { console.error(parse.error ) }
      expect(parse.success).toBeTruthy()
    })
    // Known special talker
    const [outputU, outputP] = [output[0].talker, output[1].talker]
    // @ts-ignore
    expect(outputU).toEqual({ id: talkerXX, description: 'unknown'})
    expect(outputP).toEqual({ id: talkerUU, description: 'unknown'})
  })

  test('Uncompleted frames WITHOUT memory', () => {
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const input1 = generateSentenceFromModel(storedSentences['AAM'])
    const halfInput1 = input1.slice(0, 10)
    const halfInput2 = input1.slice(10)
    const input2 = generateSentenceFromModel(storedSentences['GGA']);
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
    const input1 = generateSentenceFromModel(storedSentences['AAM'])
    const halfInput1 = input1.slice(0, 10)
    const halfInput2 = input1.slice(10)
    const input2 = generateSentenceFromModel(storedSentences['GGA']);
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
    parser.parseData(halfInput1)
    const mem = parser.parseData(halfInput2)
    expect(mem).toHaveLength(1)
  })

  test('Unknown frames', () => {
    const parser = new Parser()
    const storedSentences = parser.getSentences()
    const aam = storedSentences['AAM']
    const gga = storedSentences['GGA']
    const input1 = getFakeSentence(generateSentenceFromModel(aam), 'XXX')
    const input2 = getFakeSentence(generateSentenceFromModel(gga), 'YYY');
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
})
