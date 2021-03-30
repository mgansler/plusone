package de.martingansler.feeds.persistence.repository

import de.martingansler.feeds.persistence.entity.Article
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ArticleRepository : JpaRepository<Article, Long> {
    fun findByLink(link: String): Article?
}
