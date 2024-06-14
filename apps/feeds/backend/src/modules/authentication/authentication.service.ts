import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'

import { Prisma, PrismaService, User } from '@plusone/feeds-persistence'

import { LoginResponseDto, UserRegistrationDto } from './authentication.dto'
import { TokenPayload } from './jwt.strategy'
import { Role } from './roles.guard'

@Injectable()
export class AuthenticationService implements OnModuleInit {
  private logger = new Logger(AuthenticationService.name)

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.createRootUser()
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload: TokenPayload = {
      username: user.username,
      isAdmin: user.isAdmin,
      roles: user.isAdmin ? [Role.Admin] : [Role.User],
      id: user.id,
    }
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      }),
      refresh_token: await this.createRefreshToken(user),
    }
  }

  async logout(user: User) {
    await this.prismaService.user.update({
      data: { refreshToken: null },
      where: { id: user.id },
    })
  }

  async register(userRegistrationDto: UserRegistrationDto): Promise<Omit<User, 'password' | 'refreshToken'>> {
    try {
      return await this.prismaService.user.create({
        data: {
          ...userRegistrationDto,
          password: await hash(userRegistrationDto.password, 10),
        },
        select: { username: true, email: true, id: true, password: false, refreshToken: false, isAdmin: true },
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

  async validateUsernamePassword(username: string, enteredPassword: string): Promise<Omit<User, 'password'> | null> {
    const { password, ...rest } = await this.prismaService.user.findUniqueOrThrow({ where: { username } })
    if (await compare(enteredPassword, password)) {
      return rest
    }

    return null
  }

  async validateRefreshToken(refreshToken: string, userId: string): Promise<User | undefined> {
    const user = await this.prismaService.user.findUniqueOrThrow({ where: { id: userId } })

    if (user.refreshToken) {
      const refreshTokenIsValid = await compare(refreshToken, user.refreshToken)

      if (refreshTokenIsValid) {
        return user
      }
    }
  }

  private async createRefreshToken(user: User): Promise<string> {
    const refresh_token = this.jwtService.sign(
      { id: user.id },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
      },
    )

    await this.prismaService.user.update({
      data: { refreshToken: await hash(refresh_token, 10) },
      where: { id: user.id },
    })

    return refresh_token
  }

  private async createRootUser() {
    const username = process.env.ADMIN_USER
    const password = process.env.ADMIN_PASSWORD

    if (typeof username === 'undefined' || typeof password === 'undefined') {
      this.logger.warn('ADMIN_USER or ADMIN_PASSWORD is not set, cannot create the admin user.')
      return
    }

    if (await this.prismaService.user.findUnique({ where: { username } })) {
      this.logger.log('Admin user already exists, skipping creation.')
    } else {
      this.logger.log(`Admin user does not exist, creating account '${username}'`)
      await this.prismaService.user.create({
        data: {
          username,
          password: await hash(password, 10),
          isAdmin: true,
        },
      })
    }
  }
}
