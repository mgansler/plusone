package de.martingansler.feeds.graphql.resolver

import de.martingansler.feeds.graphql.types.Token
import de.martingansler.feeds.graphql.types.User
import de.martingansler.feeds.service.UserService
import graphql.kickstart.tools.GraphQLQueryResolver
import org.apache.logging.log4j.kotlin.Logging
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.security.access.annotation.Secured
import org.springframework.stereotype.Component
import org.springframework.web.client.RestTemplate

@Component
class AuthorizationQueryResolver(
    oAuth2ClientProperties: OAuth2ClientProperties,
    val userService: UserService
) : GraphQLQueryResolver {

    @Value("\${feeds.publicBasePath}")
    lateinit var publicBasePath: String

    val registration = oAuth2ClientProperties.registration["gitlab"]
    val provider = oAuth2ClientProperties.provider["gitlab"]

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    fun authorizationUri() = "${provider?.authorizationUri}?" +
        "response_type=code" +
        "&client_id=${registration?.clientId}" +
        "&redirect_uri=$publicBasePath" +
        "&scope=${registration?.scope?.first()}"

    @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
    fun login(code: String): Token? {
        val restTemplate = RestTemplate()
        val headers = HttpHeaders().apply {
            set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        }

        return restTemplate.postForObject(
            "${provider?.tokenUri}",
            HttpEntity(
                TokenRequest(
                    client_id = registration!!.clientId,
                    client_secret = registration!!.clientSecret,
                    grant_type = registration!!.authorizationGrantType,
                    redirect_uri = publicBasePath,
                    code = code
                ), headers
            ),
            Token::class.java
        )
    }

    @Secured("ROLE_USER")
    @Suppress("FunctionMinLength")
    fun me() = User(userService.findOrCreateUser())

    companion object : Logging
}

@Suppress("ConstructorParameterNaming")
data class TokenRequest(
    val client_id: String,
    val client_secret: String,
    val grant_type: String,
    val redirect_uri: String,
    val code: String
)
