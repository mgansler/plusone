package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.config.GitLabUser
import graphql.kickstart.execution.subscriptions.SubscriptionSession
import graphql.kickstart.execution.subscriptions.apollo.ApolloSubscriptionConnectionListener
import graphql.kickstart.execution.subscriptions.apollo.OperationMessage
import org.apache.logging.log4j.kotlin.Logging
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.stereotype.Component
import org.springframework.util.MultiValueMap
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate

@Component
class AuthenticationConnectionListener(
    val oAuth2ClientProperties: OAuth2ClientProperties
) : ApolloSubscriptionConnectionListener {
    companion object : Logging

    override fun onConnect(session: SubscriptionSession?, message: OperationMessage?) {

        val token: String? = (message?.payload as Map<String, String>)["authToken"]

        if (token != null) {
            val restTemplate = RestTemplate()
            val headers = HttpHeaders().apply {
                set(HttpHeaders.AUTHORIZATION, "Bearer $token")
            }

            try {
                val user = restTemplate.exchange(
                    oAuth2ClientProperties.provider["gitlab"]!!.userInfoUri,
                    HttpMethod.GET,
                    HttpEntity<MultiValueMap<String, String>>(headers),
                    GitLabUser::class.java
                ).body

                if (user != null) {
                    logger.info("New WebSocket connection for ${user.username}")
                    SecurityContextHolder.getContext().authentication = OAuth2AuthenticationToken(
                        DefaultOAuth2User(
                            AuthorityUtils.createAuthorityList("ROLE_USER"),
                            user.toMap(),
                            "username"
                        ),
                        AuthorityUtils.createAuthorityList("ROLE_USER"),
                        "gitlab"
                    )
                }
            } catch (ex: HttpStatusCodeException) {
                logger.error("Tried to authenticate user, got ${ex.statusCode} - ${ex.localizedMessage}")
            }
        }

        super.onConnect(session, message)
    }
}
