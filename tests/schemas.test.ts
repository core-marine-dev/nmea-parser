import { describe, test, expect } from 'vitest'
import { VersionSchema } from '../src/schemas'


describe('Version Schema', () => {
  test('Proper versions', () => {
    ['3.2.1', '3.2', '3'].forEach(version => expect(VersionSchema.parse(version)).toStrictEqual(version))
  })

  test('Failure versions', () => {
    ['3.2.1.0', '3.a', 'asdfa', '-1', '3.-2'].forEach(version => expect(VersionSchema.safeParse(version).success).toBeFalsy())
  })
})