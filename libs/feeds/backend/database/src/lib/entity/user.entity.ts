import { Column, Entity, PrimaryColumn, Unique } from 'typeorm'

@Entity({ name: 'feeds_user' })
@Unique(['username'])
export class User {
  @PrimaryColumn({ generated: 'uuid' })
  id: string

  @Column()
  username: string

  @Column()
  password: string

  @Column({ nullable: true })
  email: string | null
}
