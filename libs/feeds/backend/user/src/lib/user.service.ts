import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '@plusone/feeds/backend/database'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async getAll() {
    return await this.userRepository.find()
  }
}
