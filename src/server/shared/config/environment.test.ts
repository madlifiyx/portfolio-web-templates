import { describe, expect, test } from 'bun:test'
import { parseEnvironment } from './environment'

const validEnvironment = (): NodeJS.ProcessEnv => ({
  APP_ORIGIN: 'http://localhost:3000',
  PORT: '3000',
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://portfolio:password@localhost:5432/portfolio',
  SESSION_SECRET: '12345678901234567890123456789012',
  SESSION_TTL_SECONDS: '604800',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'portfolio-assets',
  S3_ACCESS_KEY_ID: 'portfolio-local',
  S3_SECRET_ACCESS_KEY: 'storage-secret',
})

describe('parseEnvironment', () => {
  test('parses valid configuration', () => {
    const environment = parseEnvironment(validEnvironment())
    expect(environment.port).toBe(3000)
    expect(environment.s3.bucket).toBe('portfolio-assets')
  })

  test('rejects a short session secret', () => {
    const source = validEnvironment()
    source.SESSION_SECRET = 'short'
    expect(() => parseEnvironment(source)).toThrow('at least 32 characters')
  })
})
