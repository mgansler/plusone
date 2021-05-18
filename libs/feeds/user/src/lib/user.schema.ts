import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class UserWithPassword {
  @Prop({ unique: true })
  username: string

  @Prop()
  password: string
}

export type User = Omit<UserWithPassword, 'password'>

export const UserWithPasswordSchema = SchemaFactory.createForClass(UserWithPassword)
export type UserWithPasswordDocument = UserWithPassword & Document
