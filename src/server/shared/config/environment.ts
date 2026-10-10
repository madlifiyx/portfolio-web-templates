export type Environment = {
  appOrigin: string
  port: number
  production: boolean
  databaseUrl: string
  sessionSecret: string
  sessionTtlSeconds: number
  s3: {
    endpoint: string
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
  }
}

const readRequired = (name: string, source: NodeJS.ProcessEnv): string => {
  const value = source[name]?.trim()
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

const readPositiveInteger = (name: string, source: NodeJS.ProcessEnv): number => {
  const value = Number(readRequired(name, source))
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return value
}

const readUrl = (name: string, source: NodeJS.ProcessEnv): string => {
  const value = readRequired(name, source)
  try {
    return new URL(value).toString().replace(/\/$/, '')
  } catch {
    throw new Error(`${name} must be a valid URL`)
  }
}

export const parseEnvironment = (source: NodeJS.ProcessEnv): Environment => {
  const sessionSecret = readRequired('SESSION_SECRET', source)
  if (sessionSecret.length < 32)
    throw new Error('SESSION_SECRET must contain at least 32 characters')

  return {
    appOrigin: readUrl('APP_ORIGIN', source),
    port: readPositiveInteger('PORT', source),
    production: source.NODE_ENV === 'production',
    databaseUrl: readRequired('DATABASE_URL', source),
    sessionSecret,
    sessionTtlSeconds: readPositiveInteger('SESSION_TTL_SECONDS', source),
    s3: {
      endpoint: readUrl('S3_ENDPOINT', source),
      region: readRequired('S3_REGION', source),
      bucket: readRequired('S3_BUCKET', source),
      accessKeyId: readRequired('S3_ACCESS_KEY_ID', source),
      secretAccessKey: readRequired('S3_SECRET_ACCESS_KEY', source),
    },
  }
}
