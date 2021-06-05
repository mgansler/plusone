package de.martingansler.feeds.persistence.entity

import org.hibernate.annotations.Type
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.OneToMany

@Entity
data class Feed(
    @Id
    @GeneratedValue
    @Type(type = "pg-uuid")
    val id: UUID = UUID.randomUUID(),

    @Column(unique = true, nullable = false)
    val uri: String,

    @Column
    var title: String? = "",

    @Column
    var icon: String? = null,

    @Column
    var hasFetchError: Boolean,

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "feed")
    var articles: List<Article>? = null,

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "feed")
    var userFeeds: Set<UserFeed> = setOf()
)
