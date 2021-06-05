package de.martingansler.feeds.service

import de.martingansler.feeds.persistence.entity.User
import de.martingansler.feeds.persistence.repository.UserRepository
import graphql.kickstart.servlet.context.DefaultGraphQLServletContext
import graphql.schema.DataFetchingEnvironment
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.stereotype.Service
import java.security.Principal

@Service
class UserService(
    val userRepository: UserRepository
) {

    fun findOrCreateUser(): User {
        val auth = SecurityContextHolder.getContext().authentication
        val principal = auth.principal as DefaultOAuth2User

        return userRepository.findByUsername(auth.name)
            ?: userRepository.save(
                User(
                    username = auth.name,
                    name = principal.attributes["name"]?.toString(),
                    email = principal.attributes["email"]?.toString(),
                    avatar_url = principal.attributes["avatar_url"]?.toString()
                )
            )
    }

    fun findOrCreateUser(principal: Principal): User {
        val username = (principal as OAuth2AuthenticationToken).name
        return userRepository.findByUsername(username) ?: userRepository.save(User(
            username = username,
            name = principal.principal.attributes["name"]?.toString(),
            email = principal.principal.attributes["email"]?.toString(),
            avatar_url = principal.principal.attributes["avatar_url"]?.toString()
        ))
    }

    companion object {
        fun getPrincipal(env: DataFetchingEnvironment): OAuth2User {
            return (env.getContext<DefaultGraphQLServletContext>().httpServletRequest.userPrincipal as OAuth2AuthenticationToken).principal
        }
    }
}
