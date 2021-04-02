package de.martingansler.feeds.persistence.entity

import org.hibernate.annotations.Type
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.Table

@Entity
@Table(name = "feeds_user")
@Suppress("ConstructorParameterNaming")
data class User(
    @Id
    @GeneratedValue
    @Type(type = "pg-uuid")
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false)
    val username: String,

    @Column
    val name: String? = null,

    @Column
    val email: String? = null,

    @Column
    val avatar_url: String? = null,

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "user")
    var userFeeds: Set<UserFeed> = setOf(),

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "user")
    var userArticles: Set<UserArticle> = setOf()
) {
    fun toMap(): Map<String, String?> = mapOf(
        "username" to this.username,
        "name" to this.name,
        "email" to this.email,
        "avatar_url" to this.avatar_url
    )
}
