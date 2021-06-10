import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Article {
  @PrimaryColumn({ generated: 'uuid' })
  id: string

  @Column()
  content: string

  @Column()
  contentBody: string

  @Column()
  guid: string

  @Column()
  link: string

  @Column()
  title: string
}
