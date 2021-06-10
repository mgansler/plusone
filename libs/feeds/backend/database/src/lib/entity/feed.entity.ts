import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Feed {
  @PrimaryColumn({ generated: 'uuid' })
  id: string

  @Column()
  title: string

  @Column()
  feedUrl: string
}
