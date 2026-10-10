import { describe, expect, test } from 'bun:test'
import { parseLoginInput } from './schema'

describe('parseLoginInput', () => {
  test('normalizes valid credentials', () => {
    expect(parseLoginInput({ email: ' ADMIN@example.com ', password: 'long-password' })).toEqual({
      email: 'admin@example.com',
      password: 'long-password',
    })
  })

  test('rejects malformed input', () => {
    expect(() => parseLoginInput({ email: 'invalid', password: 'short' })).toThrow(
      'Invalid login fields',
    )
  })
})
