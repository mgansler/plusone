import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

const DO_NOT_LOG_ENDPOINTS: Array<RegExp> = [/\/api\/health/, /\/api\/trailAreas\/\d+\/weather.*/]

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger()

  use(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      const { statusCode } = res
      if (!DO_NOT_LOG_ENDPOINTS.some((url) => req.originalUrl.match(url))) {
        this.logger.log(req.originalUrl, `${req.method} ${statusCode}`)
      }
    })

    next()
  }
}
