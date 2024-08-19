import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger()

  use(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      const { statusCode } = res
      this.logger.log(req.originalUrl, `${req.method} ${statusCode}`)
    })

    next()
  }
}
