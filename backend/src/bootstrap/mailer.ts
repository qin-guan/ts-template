import nodemailer, { SendMailOptions, Transporter } from 'nodemailer'
import { SES } from 'aws-sdk'

import config from '../config'
import { createCustomLogger } from './logging'

const region = config.get('awsRegion')
const logger = createCustomLogger(module)

export const mailer: Pick<Transporter, 'sendMail'> = region
  ? nodemailer.createTransport({
      SES: new SES({
        region,
        httpOptions: {
          connectTimeout: 20000,
        },
      }),
    })
  : {
      sendMail: (options: SendMailOptions) => {
        logger.info({
          message: 'Sending email with mock transport',
          meta: {
            function: 'sendMail',
            options,
          },
        })
        return Promise.resolve(options)
      },
    }
export default mailer
