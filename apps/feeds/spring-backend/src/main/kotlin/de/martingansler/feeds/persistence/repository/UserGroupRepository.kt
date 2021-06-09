package de.martingansler.feeds.persistence.repository

import de.martingansler.feeds.persistence.entity.User
import de.martingansler.feeds.persistence.entity.UserGroup
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface UserGroupRepository : JpaRepository<UserGroup, UUID> {
    fun findAllByUser(user: User): List<UserGroup>

    fun findByIdAndUser(id: UUID, user: User): UserGroup?
}
