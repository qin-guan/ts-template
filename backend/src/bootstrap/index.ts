import express, { Express } from 'express'
import session from 'express-session'
import helmet from 'helmet'
import minimatch from 'minimatch'
import { totp as totpFactory } from 'otplib'
import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import { Sequelize as OriginSequelize } from 'sequelize'

import SequelizeStoreFactory from 'connect-session-sequelize'

// Sequelize-related imports
import * as sequelizeConfig from '../database/config/config'
import { User } from '../database/models/User'

import config, { NodeEnv } from '../config'
import api from '../api'
import { AuthController, AuthService } from '../auth'

import mailer from './mailer'
import helmetOptions from './helmet'
import { createCustomLogger } from './logging'

type DatabaseConfigType = { [n in NodeEnv]: SequelizeOptions }

const logger = createCustomLogger(module)

const step = config.get('otpExpiry') / 2

const totp = totpFactory.clone({ step, window: [1, 0] })

const mailSuffix = config.get('mailSuffix')

const emailValidator = new minimatch.Minimatch(mailSuffix, {
  noext: true,
  noglobstar: true,
  nobrace: true,
  nonegate: true,
})

export async function bootstrap(): Promise<{
  app: Express
  sequelize: Sequelize
}> {
  // Create Sequelize instance and add models
  const nodeEnv = config.get('nodeEnv')
  const options = (sequelizeConfig as DatabaseConfigType)[nodeEnv]

  logger.info({
    message: 'Creating Sequelize instance and adding models',
    meta: { function: 'bootstrap' },
  })
  const sequelize = new Sequelize(options)
  sequelize.addModels([User])

  const auth = new AuthController({
    service: new AuthService({
      secret: config.get('otpSecret'),
      appHost: config.get('appHost'),
      emailValidator,
      totp,
      mailer,
      User,
    }),
  })

  const SequelizeStore = SequelizeStoreFactory(session.Store)

  const secure = [NodeEnv.Prod, NodeEnv.Staging].includes(nodeEnv)

  const sessionMiddleware = session({
    store: new SequelizeStore({
      db: sequelize as OriginSequelize,
      tableName: 'sessions',
    }),
    resave: false, // can set to false since touch is implemented by our store
    saveUninitialized: false, // do not save new sessions that have not been modified
    cookie: {
      httpOnly: true,
      sameSite: 'strict',
      secure,
      maxAge: config.get('cookieMaxAge'),
    },
    secret: config.get('sessionSecret'),
    name: config.get('projectName'),
  })

  const app = express()
  app.use(helmet(helmetOptions))

  if (secure) {
    app.set('trust proxy', 1)
  }

  const apiMiddleware = [sessionMiddleware, express.json()]
  app.use('/api/v1', apiMiddleware, api({ auth }))

  logger.info({
    message: 'Connecting to Sequelize',
    meta: {
      function: 'bootstrap',
    },
  })
  await sequelize.authenticate()
  return { app, sequelize }
}

export default bootstrap
