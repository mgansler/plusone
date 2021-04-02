package de.martingansler.feeds.persistence.entity

import org.hibernate.annotations.Type
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
@Suppress("UseDataClass") // TODO: This results in an StackOverflowException
class UserArticle(
    @Id
    @GeneratedValue
    @Type(type = "pg-uuid")
    val id: UUID = UUID.randomUUID(),

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: User,

    @ManyToOne
    @JoinColumn(name = "article_id")
    val article: Article,

    @Column
    var unread: Boolean
)
