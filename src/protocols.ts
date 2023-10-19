import { writeFileSync, readFileSync }  from 'node:fs'
import path from 'node:path'
import zodToJsonSchema from 'zod-to-json-schema'
import { ProtocolsFileSchema } from './schemas'


export const jsonSchema = zodToJsonSchema(ProtocolsFileSchema, 'NMEAProtocolsSchema')

export const createJSONSchema = () => {
  const FILE = path.join(__dirname, 'nmea_protocols_schema.json')
  const CONTENT = JSON.stringify(jsonSchema, null, 2)
  writeFileSync(FILE, CONTENT)
}

export const readYamlFile = (file: string) => {
  
}
