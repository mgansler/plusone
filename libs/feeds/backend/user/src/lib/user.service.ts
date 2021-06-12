import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { hash } from 'bcrypt'

import { User } from '@plusone/feeds/backend/database'

import { UserRegisterDto } from './user-register.dto'

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name)

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async onModuleInit(): Promise<void> {
    await this.createRootUser()
  }

  async create(user: UserRegisterDto): Promise<User> {
    const createdUser = await this.userRepository.create(user)
    return this.userRepository.save(createdUser)
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } })
  }

  private async createRootUser() {
    const rootUsername = process.env.ADMIN_USER
    const rootPassword = process.env.ADMIN_PASSWORD
    if (!(await this.userRepository.findOne({ where: { username: rootUsername } }))) {
      this.logger.log(`Admin user does not exist, creating account '${rootUsername}'`)
      const rootUser = await this.userRepository.create({
        username: rootUsername,
        password: await hash(rootPassword, 10),
        isAdmin: true,
      })
      await this.userRepository.save(rootUser)
    }
  }
}
