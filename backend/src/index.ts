import bootstrap from './bootstrap'
import { createCustomLogger } from './bootstrap/logging'
import config from './config'

const logger = createCustomLogger(module)

const port = config.get('port')
bootstrap().then(({ app }) =>
  app.listen(port, () =>
    logger.info({
      message: `Listening on port ${port}`,
      meta: { function: 'app.listen' },
    })
  )
)
