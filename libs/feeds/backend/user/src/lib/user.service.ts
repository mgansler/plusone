import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { User } from '@plusone/feeds/backend/database'

import { UserRegisterDto } from './user-register.dto'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(user: UserRegisterDto): Promise<User> {
    const createdUser = await this.userRepository.create(user)
    return this.userRepository.save(createdUser)
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } })
  }
}
