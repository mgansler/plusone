import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '@plusone/feeds/backend/database'

import { JwtPayload } from './jwt.payload'
import { UserRegisterDto } from './user-register-dto'

@Injectable()
export class AuthenticationService implements OnModuleInit {
  private logger = new Logger(AuthenticationService.name)

  constructor(@InjectRepository(User) private userRepository: Repository<User>, private jwtService: JwtService) {}

  async onModuleInit(): Promise<void> {
    await this.createRootUser()
  }

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOne({
      select: ['username', 'password', 'email', 'isAdmin'],
      where: { username },
    })
    if (user && (await compare(password, user.password))) {
      user.password = undefined
      return user
    }

    return null
  }

  async login(user: User) {
    const payload: JwtPayload = { username: user.username, isAdmin: user.isAdmin }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async register(userRegisterDto: UserRegisterDto): Promise<Omit<User, 'password'>> {
    try {
      const createdUser = await this.userRepository.create({
        ...userRegisterDto,
        password: await hash(userRegisterDto.password, 10),
      })
      const user = await this.userRepository.save(createdUser)
      user.password = undefined
      return user
    } catch (e) {
      if (e.code === 11000) {
        this.logger.warn(`Registration failed, user with username '${userRegisterDto.username}' already exists.`)
        throw new HttpException(`User '${userRegisterDto.username}' already exists`, HttpStatus.CONFLICT)
      }
      this.logger.error(e)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
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
