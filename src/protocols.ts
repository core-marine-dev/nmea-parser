import fs  from 'node:fs'
import Path from 'node:path'
import zodToJsonSchema from 'zod-to-json-schema'
import yaml from 'js-yaml'
import { JSONSchemaInputSchema, ProtocolsFileSchema, StringSchema } from './schemas'
import { JSONSchemaInput, ProtocolsFile } from './types'

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
