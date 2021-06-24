import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'

import { Prisma, PrismaService, User } from '@plusone/feeds/backend/persistence'

import { JwtPayload } from './jwt.payload'
import { UserRegistrationDto } from './user.dto'

@Injectable()
export class AuthenticationService implements OnModuleInit {
  private logger = new Logger(AuthenticationService.name)

  constructor(private prismaService: PrismaService, private jwtService: JwtService) {}

  async onModuleInit(): Promise<void> {
    await this.createRootUser()
  }

  async validateUser(username: string, password: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prismaService.user.findUnique({ where: { username } })
    if (user && (await compare(password, user.password))) {
      user.password = undefined
      return user
    }

    return null
  }

  async login(user: User) {
    const payload: JwtPayload = { username: user.username, isAdmin: user.isAdmin, roles: user.isAdmin ? ['admin'] : [] }
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async register(userRegistrationDto: UserRegistrationDto): Promise<Omit<User, 'password'>> {
    try {
      return await this.prismaService.user.create({
        data: {
          ...userRegistrationDto,
          password: await hash(userRegistrationDto.password, 10),
        },
        select: { username: true, email: true, id: true, password: false, isAdmin: true },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          this.logger.warn(`Registration failed, user with username '${userRegistrationDto.username}' already exists.`)
          throw new HttpException(`User '${userRegistrationDto.username}' already exists`, HttpStatus.CONFLICT)
        }
      }
      this.logger.error(e)
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  private async createRootUser() {
    const username = process.env.ADMIN_USER
    const password = process.env.ADMIN_PASSWORD

    if (!(await this.prismaService.user.findUnique({ where: { username } }))) {
      this.logger.log(`Admin user does not exist, creating account '${username}'`)
      await this.prismaService.user.create({
        data: {
          username,
          password: await hash(password, 10),
          isAdmin: true,
        },
      })
    } else {
      this.logger.log('Admin user already exists, skipping creation.')
    }
  }
}
