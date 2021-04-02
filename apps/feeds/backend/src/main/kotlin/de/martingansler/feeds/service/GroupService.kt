package de.martingansler.feeds.service

import de.martingansler.feeds.feed.FeedNotFoundException
import de.martingansler.feeds.feed.GroupNotFoundException
import de.martingansler.feeds.graphql.types.GroupInput
import de.martingansler.feeds.persistence.entity.UserGroup
import de.martingansler.feeds.persistence.repository.UserFeedRepository
import de.martingansler.feeds.persistence.repository.UserGroupRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class GroupService(
    val userService: UserService,
    val userFeedRepository: UserFeedRepository,
    val userGroupRepository: UserGroupRepository
) {
    fun groupsForCurrentUser(): List<UserGroup> =
        userGroupRepository.findAllByUser(userService.findOrCreateUser())

    fun groupByFeedForCurrentUser(feedId: UUID): UserGroup? {
        val userFeed = userFeedRepository.findByFeedIdAndUser(feedId, userService.findOrCreateUser())
            ?: throw FeedNotFoundException(feedId)
        return userFeed.group
    }

    fun addGroupForCurrentUser(input: GroupInput): UserGroup =
        userGroupRepository.save(UserGroup(name = input.name, user = userService.findOrCreateUser()))

    fun addFeedToCurrentUserGroup(feedId: UUID, groupId: UUID): UserGroup {
        val user = userService.findOrCreateUser()
        val userFeed = userFeedRepository.findByFeedIdAndUser(feedId = feedId, user = user)
            ?: throw FeedNotFoundException(feedId)
        val group = userGroupRepository.findByIdAndUser(id = groupId, user = user)
            ?: throw GroupNotFoundException(groupId)

        group.feeds.add(userFeed)
        userFeed.group = group

        userFeedRepository.save(userFeed)

        return userGroupRepository.save(group)
    }
}
