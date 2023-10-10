import { z } from 'zod'
import { NMEALineSchema, NMEASentenceSchema } from './schemas'

// NMEA
export type NMEALine = z.infer<typeof NMEALineSchema>
export type NMEASentence = z.infer<typeof NMEASentenceSchema>
