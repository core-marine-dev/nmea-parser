import { writeFileSync } from 'node:fs'

import { jsonSchema } from './schemas'

writeFileSync('nmea_protocols_schema.json', JSON.stringify(jsonSchema, null, 2))
