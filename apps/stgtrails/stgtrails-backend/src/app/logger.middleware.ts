import { Injectable, Logger, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger()

  private static WEATHER_API_ENDPOINT = /\/api\/trailAreas\/\d+\/weather.*/

  use(req: Request, res: Response, next: NextFunction) {
    res.on('close', () => {
      const { statusCode } = res
      if (!req.originalUrl.match(LoggerMiddleware.WEATHER_API_ENDPOINT)) {
        this.logger.log(req.originalUrl, `${req.method} ${statusCode}`)
      }
    })

    next()
  }
}
