import { Inject, Injectable } from '@nestjs/common'
import { Model } from 'mongoose'

import { UserWithPasswordDocument } from './user.schema'
import { USER_MODEL } from './user.constants'

@Injectable()
export class UserService {
  constructor(@Inject(USER_MODEL) private userModel: Model<UserWithPasswordDocument>) {}

  async create(user): Promise<UserWithPasswordDocument> {
    const createdUser = new this.userModel(user)
    return createdUser.save()
  }

  async findOne(username: string): Promise<UserWithPasswordDocument | undefined> {
    return this.userModel.findOne({ username })
  }
}
