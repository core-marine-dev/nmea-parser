import fs  from 'node:fs'
import Path from 'node:path'
import zodToJsonSchema from 'zod-to-json-schema'
import yaml from 'js-yaml'
import { JSONSchemaInputSchema, ProtocolsFileSchema, StringSchema } from './schemas'
import { JSONSchemaInput, Protocol, ProtocolsFile, StoredSentence, StoredSentences } from './types'

export const jsonSchema = zodToJsonSchema(ProtocolsFileSchema, 'NMEAProtocolsSchema')

export const createJSONSchema = (input: JSONSchemaInput) => {
  const { path, filename } = JSONSchemaInputSchema.parse(input)
  const FILE = Path.join(path, filename)
  const CONTENT = JSON.stringify(jsonSchema, null, 2)
  fs.writeFileSync(FILE, CONTENT)
}

export const readProtocolsFile = (file: string): ProtocolsFile => {
  const filename = StringSchema.parse(file)
  const content = fs.readFileSync(filename, 'utf-8')
  const fileData = yaml.load(content)
  return ProtocolsFileSchema.parse(fileData)
}

const getStoreSentencesFromProtocol = (protocol: Protocol) => {
  const { protocol: name, standard, version, sentences } = protocol
  const storedSentences: StoredSentences = new Map()
  sentences.forEach(element => {
    const obj: StoredSentence = {
      sentence: element.sentence,
      fields: element.fields,
      protocol: { name, standard, version },
      description: element?.description
    }
    storedSentences.set(element.sentence, obj)
  })
  return storedSentences
}

export const getStoreSentences = ({ protocols }: ProtocolsFile): StoredSentences => {
  let storedSentences: StoredSentences = new Map()
  protocols.forEach(protocol => {
    storedSentences = new Map([...storedSentences, ...getStoreSentencesFromProtocol(protocol)])
  })
  return storedSentences
}
