import fs from 'node:fs'
import path from 'node:path'
import { describe, test, expect } from 'vitest'
import { Protocol, StoredSentence } from '../src/types'
import { getStoreSentences, readProtocolsFile, readProtocolsString } from '../src/protocols' 
import { ProtocolSchema } from '../src/schemas'

const PROTOCOLS_FILE = path.join(__dirname, 'norsub.yaml')
const EXPECTED_PROTOCOLS: Protocol[] = [
  {
    protocol: 'NORSUB8',
    standard: false,
    sentences: [
      {
        sentence: 'PNORSUB8',
        description: 'The whole regular attitude information from the MRU',
        fields: [
          {
            name: 'time',
            type: 'uint32',
            units: 'us'
          },
          {
            name: 'delay',
            type: 'uint32',
            units: 'us',
          },
          {
            name: 'roll',
            type: 'double',
            units: 'deg',
          },
          {
            name: 'pitch',
            type: 'double',
            units: 'deg',
          },
          {
            name: 'heading',
            type: 'double',
            units: 'deg',
            note: 'From 0 to 360'
          },
          {
            name: 'surge',
            type: 'double',
            units: 'm',
          },
          {
            name: 'sway',
            type: 'double',
            units: 'm',
          },
          {
            name: 'heave',
            type: 'double',
            units: 'm',
            note: 'z-down'
          },
          {
            name: 'roll_rate',
            type: 'double',
            units: 'deg/s',
          },
          {
            name: 'pitch_rate',
            type: 'double',
            units: 'deg/s',
          },
          {
            name: 'yaw_rate',
            type: 'double',
            units: 'deg/s',
          },
          {
            name: 'surge_velocity',
            type: 'double',
            units: 'm/s',
          },
          {
            name: 'sway_velocity',
            type: 'double',
            units: 'm/s',
          },
          {
            name: 'heave_velocity',
            type: 'double',
            units: 'm/s',
            note: 'z-down'
          },
          {
            name: 'acceleration_x',
            type: 'double',
            units: 'm/s2',
          },
          {
            name: 'acceleration_y',
            type: 'double',
            units: 'm/s2',
          },
          {
            name: 'acceleration_z',
            type: 'double',
            units: 'm/s2',
          },
          {
            name: 'period_x',
            type: 'double',
            units: 's',
          },
          {
            name: 'period_y',
            type: 'double',
            units: 's',
          },
          {
            name: 'period_z',
            type: 'double',
            units: 's',
          },
          {
            name: 'amplitude_x',
            type: 'double',
            units: 'm',
          },
          {
            name: 'amplitude_y',
            type: 'double',
            units: 'm',
          },
          {
            name: 'amplitude_z',
            type: 'double',
            units: 'm',
          },
          {
            name: 'status',
            type: 'uint32'
          }
        ],
      }
    ]
  },
  {
    protocol: 'GYROCOMPAS1',
    standard: false,
    sentences: [
      { sentence: 'HEHDT', fields: [
        { name: 'heading', type: 'float', units: 'deg' },
        { name: 'symbol', type: 'string' },
      ] },
      { sentence: 'PHTRO', fields: [
        { name: 'pitch', type: 'float', units: 'deg' },
        { name: 'pitch_direction', type: 'string', note: 'M bow up, P bow down' },
        { name: 'roll', type: 'float', units: 'deg' },
        { name: 'roll_direction', type: 'string', note: 'M bow up, P bow down' },
      ] },
      { sentence: 'PHINF', fields: [ { name: 'status', type: 'string' } ] },
    ]
  }
]
const EXPECTED_STORED_SENTECES: Record<string, StoredSentence> = {
  'PNORSUB8': {
    sentence: EXPECTED_PROTOCOLS[0].sentences[0].sentence,
    protocol: {
      name: EXPECTED_PROTOCOLS[0].protocol,
      standard: EXPECTED_PROTOCOLS[0].standard,
      version: EXPECTED_PROTOCOLS[0]?.version,
    },
    fields: EXPECTED_PROTOCOLS[0].sentences[0].fields,
    description: EXPECTED_PROTOCOLS[0].sentences[0]?.description
  },
  'HEHDT': {
    sentence: EXPECTED_PROTOCOLS[1].sentences[0].sentence,
    protocol: {
      name: EXPECTED_PROTOCOLS[1].protocol,
      standard: EXPECTED_PROTOCOLS[1].standard,
      version: EXPECTED_PROTOCOLS[1]?.version,
    },
    fields: EXPECTED_PROTOCOLS[1].sentences[0].fields,
    description: EXPECTED_PROTOCOLS[1].sentences[0]?.description
  },
  'PHTRO': {
    sentence: EXPECTED_PROTOCOLS[1].sentences[1].sentence,
    protocol: {
      name: EXPECTED_PROTOCOLS[1].protocol,
      standard: EXPECTED_PROTOCOLS[1].standard,
      version: EXPECTED_PROTOCOLS[1]?.version,
    },
    fields: EXPECTED_PROTOCOLS[1].sentences[1].fields,
    description: EXPECTED_PROTOCOLS[1].sentences[1]?.description
  },
  'PHINF': {
    sentence: EXPECTED_PROTOCOLS[1].sentences[2].sentence,
    protocol: {
      name: EXPECTED_PROTOCOLS[1].protocol,
      standard: EXPECTED_PROTOCOLS[1].standard,
      version: EXPECTED_PROTOCOLS[1]?.version,
    },
    fields: EXPECTED_PROTOCOLS[1].sentences[2].fields,
    description: EXPECTED_PROTOCOLS[1].sentences[2]?.description
  },
}

describe('Protocols Files', () => {

  test('Right protocols file', () => {
    const { protocols } = readProtocolsFile(PROTOCOLS_FILE)
    protocols.forEach(protocol => {
      const parsed = ProtocolSchema.safeParse(protocol)
      if (!parsed.success) { console.error(parsed.error) }
      expect(parsed.success).toBeTruthy()
    })
    // expect(protocols).toStrictEqual(EXPECTED_PROTOCOLS)
  })
})

describe('Protocols File to StoredSentences', () => {
  test('Happy path', () => {
    const { protocols } = readProtocolsFile(PROTOCOLS_FILE)
    const sentences = getStoreSentences({ protocols })
    Object.keys(EXPECTED_STORED_SENTECES).forEach(key => {
    // sentences.forEach((value, key) => {
      const expected = EXPECTED_STORED_SENTECES[key]
      const value = sentences.get(key)
      expect(value).toEqual(expected)
    })
  })
})

describe('Protocols content to StoredSentences', () => {
  test('Happy path', () => {
    const content = fs.readFileSync(PROTOCOLS_FILE, 'utf-8')
    const { protocols } = readProtocolsString(content)
    const sentences = getStoreSentences({ protocols })
    Object.keys(EXPECTED_STORED_SENTECES).forEach(key => {
    // sentences.forEach((value, key) => {
      const expected = EXPECTED_STORED_SENTECES[key]
      const value = sentences.get(key)
      expect(value).toEqual(expected)
    })
  })
})
