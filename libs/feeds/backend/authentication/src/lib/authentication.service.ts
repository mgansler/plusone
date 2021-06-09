import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'

import { UserRegisterDto, UserService } from '@plusone/feeds/backend/user'
import { User } from '@plusone/feeds/backend/database'

import { JwtPayload } from './jwt.payload'

@Injectable()
export class AuthenticationService {
  private logger = new Logger(AuthenticationService.name)

  constructor(private userService: UserService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const userWithPassword = await this.userService.findOne(username)
    if (userWithPassword && (await compare(password, userWithPassword.password))) {
      const { username, id } = userWithPassword
      return { username, id }
    }

    return null
  }

  async login(user: User) {
    const payload: JwtPayload = { username: user.username }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async register(user: UserRegisterDto) {
    try {
      return await this.userService.create({ username: user.username, password: await hash(user.password, 10) })
    } catch (e) {
      if (e.code === 11000) {
        this.logger.warn(`Registration failed, user with username '${user.username}' already exists.`)
        throw new HttpException(`User '${user.username}' already exists`, HttpStatus.CONFLICT)
      }
      this.logger.error(e)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
