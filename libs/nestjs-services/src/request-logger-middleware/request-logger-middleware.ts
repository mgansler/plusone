import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger()

  use(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      const { statusCode } = res
      this.logger.log(req.originalUrl.replace('/api', ''), `${req.method} ${statusCode}`)
    })

    next()
  }
}
