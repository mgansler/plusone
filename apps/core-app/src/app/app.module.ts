import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { ScheduleModule } from '@nestjs/schedule'

import { FeedsModule } from '../feeds/feeds.module'

import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'DISCOVER_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost'],
          queue: 'discover',
          queueOptions: { durable: false },
        },
      },
    ]),
    ClientsModule.register([
      {
        name: 'FETCH_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost'],
          queue: 'fetch',
          queueOptions: { durable: false, arguments: { 'x-message-ttl': 3000 } },
        },
      },
    ]),
    ScheduleModule.forRoot(),
    FeedsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
