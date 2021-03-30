package de.martingansler.feeds.persistence.entity

import org.hibernate.annotations.Type
import java.util.Date
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.OneToMany

@Entity
data class Article(
    @Id
    @GeneratedValue
    @Type(type = "pg-uuid")
    val id: UUID = UUID.randomUUID(),

    @Column(unique = true)
    val link: String,

    @Column(columnDefinition = "text")
    val title: String,

    @Column
    val author: String,

    @Column(columnDefinition = "text")
    val content: String,

    @Column
    val publishedDate: Date = Date(),

    @Column
    val updatedDate: Date? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    val feed: Feed,

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "article")
    var userArticles: Set<UserArticle> = setOf()
)
