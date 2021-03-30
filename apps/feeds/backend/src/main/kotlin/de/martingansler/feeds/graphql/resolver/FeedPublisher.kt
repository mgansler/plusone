package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Feed
import de.martingansler.feeds.persistence.repository.UserFeedRepository
import de.martingansler.feeds.service.UserService
import io.reactivex.BackpressureStrategy
import io.reactivex.Flowable
import io.reactivex.subjects.PublishSubject
import org.apache.logging.log4j.kotlin.Logging
import org.reactivestreams.Publisher
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.stereotype.Service

@Service
class FeedPublisher(
    private val userService: UserService,
    private val userFeedRepository: UserFeedRepository
) {
    final val subject: PublishSubject<de.martingansler.feeds.persistence.entity.Feed> = PublishSubject.create<de.martingansler.feeds.persistence.entity.Feed>()
    lateinit var publisher: Flowable<de.martingansler.feeds.persistence.entity.Feed>

    init {
        val connectable = subject.share().publish()
        connectable.connect()
        publisher = connectable.toFlowable(BackpressureStrategy.BUFFER)
    }

    fun getPublisher(): Publisher<Feed> {
        val user = userService.findOrCreateUser()

        val fSub = PublishSubject.create<Feed>()
        subject.subscribe {
            SecurityContextHolder.getContext().authentication = OAuth2AuthenticationToken(
                DefaultOAuth2User(
                    AuthorityUtils.createAuthorityList("ROLE_USER"),
                    user.toMap(),
                    "username"
                ),
                AuthorityUtils.createAuthorityList("ROLE_USER"),
                "gitlab"
            )

            if (userFeedRepository.findByFeedAndUser(feed = it, user = user) != null) {
                fSub.onNext(Feed(it))
            }
        }
        val c = fSub.publish()
        c.connect()
        return c.toFlowable(BackpressureStrategy.BUFFER)
    }

    companion object : Logging
}
