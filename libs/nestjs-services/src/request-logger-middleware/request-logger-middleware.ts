import { randomUUID } from 'crypto'

import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

/**
 * Correlation ID header used to trace a single request through logs.
 */
export const CORRELATION_ID_HEADER = 'X-Correlation-Id'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers[CORRELATION_ID_HEADER] ?? randomUUID()
    const start = performance.now()

    // Attach correlation ID to response headers so the client can echo it back
    res.setHeader(CORRELATION_ID_HEADER, correlationId)

    res.on('close', () => {
      const duration = performance.now() - start
      const path = req.originalUrl.replace('/api', '')

      // Log at different levels based on status code
      if (res.statusCode >= 500) {
        this.logger.error(`${req.method} ${res.statusCode} ${path} ${duration.toFixed(0)}ms`, {
          correlationId,
          duration,
        })
      } else if (res.statusCode >= 400) {
        this.logger.warn(`${req.method} ${res.statusCode} ${path} ${duration.toFixed(0)}ms`, {
          correlationId,
          duration,
        })
      } else {
        this.logger.log(`${req.method} ${res.statusCode} ${path} ${duration.toFixed(0)}ms`, {
          correlationId,
          duration,
        })
      }
    })

    next()
  }
}
