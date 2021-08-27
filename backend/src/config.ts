/**
 * @file Configuration
 * All defaults can be changed
 */
import convict from 'convict'

export enum NodeEnv {
  Prod = 'production',
  Staging = 'staging',
  Dev = 'development',
  Test = 'test',
}

/**
 * To require an env var without setting a default,
 * use
 *    default: '',
 *    format: 'required-string',
 *    sensitive: true,
 */
convict.addFormats({
  'required-string': {
    validate: (val: unknown): void => {
      if (val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
    coerce: <T extends unknown>(val: T): T | undefined => {
      if (val === null) {
        return undefined
      }
      return val
    },
  },
})

const config = convict({
  port: {
    doc: 'The port that the service listens on',
    env: 'PORT',
    format: 'int',
    default: 8080,
  },
  awsRegion: {
    doc: 'The region in which the AWS service is running in',
    env: 'AWS_REGION',
    format: '*',
    default: 'ap-southeast-1',
  },
  nodeEnv: {
    doc: 'The environment that NodeJS is running',
    env: 'NODE_ENV',
    format: Object.values(NodeEnv),
    default: NodeEnv.Dev,
  },
  cookieMaxAge: {
    doc: 'The maximum age for a cookie, expressed in ms',
    env: 'COOKIE_MAX_AGE',
    format: 'int',
    default: 86400000, // 24 hours
  },
  db:{
    host: {
      doc: 'The database host address',
      env: 'DB_HOST',
      format: '*',
      default: '',
    },
    database: {
      doc: 'The database name',
      env: 'DB_NAME',
      format: '*',
      default: '',
    },
    port: {
      doc: 'The database port number',
      env: 'DB_PORT',
      format: 'int',
      default: '',
    },
    password: {
      doc: 'The database password',
      env: 'DB_PASSWORD',
      format: '*',
      default: '',
    },
    username: {
      doc: 'The database username',
      env: 'DB_USERNAME',
      format: '*',
      default: '',
    },
    dialect: {
      doc: 'The database dialect',
      env: 'DB_DIALECT',
      format: '*',
      default: 'postgres',
    },
  },
  appHost: {
    doc: 'The fully-qualified domain name of the application',
    env: 'APP_HOST',
    format: '*',
    default: 'default.gov.sg',
  },
  otpExpiry: {
    doc: 'The number of seconds that an OTP is valid for a user',
    env: 'OTP_EXPIRY',
    format: 'int',
    default: 300,
  },
  otpSecret: {
    doc: 'A secret string used to generate TOTPs for users',
    env: 'OTP_SECRET',
    format: '*',
    default: 'toomanysecrets',
  },
  sessionSecret: {
    doc: 'A secret string used to generate sessions for users',
    env: 'SESSION_SECRET',
    format: '*',
    default: 'toomanysecrets',
  },
  mailSuffix: {
    doc: 'The domain suffix expected for e-mail logins',
    env: 'MAIL_SUFFIX',
    format: '*',
    default: '*.gov.sg',
  },
  projectName: {
    doc: 'The name of this software project or repo',
    env: 'PROJECT_NAME',
    format: '*',
    default: 'ts-template'
  }
})

export default config
