import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('', { timestamp: true })

  use(req: Request, res: Response, next: NextFunction) {
    const startTs = Date.now()

    // @ts-expect-error private method
    this.logger.localInstance.updateAndGetTimestampDiff()

    res.on('close', () => {
      const { statusCode } = res
      process.stdout.write(`[Nest] ${process.pid}`)
      this.logger.log(req.originalUrl.replace('/api', ''), `${req.method} ${statusCode}`)
    })

    next()
  }
}
