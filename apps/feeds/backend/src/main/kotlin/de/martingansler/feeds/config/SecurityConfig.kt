package de.martingansler.feeds.config

import org.apache.logging.log4j.kotlin.Logging
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken
import org.springframework.security.oauth2.core.user.DefaultOAuth2User
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.stereotype.Component
import org.springframework.util.MultiValueMap
import org.springframework.web.client.HttpStatusCodeException
import org.springframework.web.client.RestTemplate
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Profile("!noAuth")
@Configuration
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
class SecurityConfig(val tokenSecurityFilter: GitLabSecurityFilter) : WebSecurityConfigurerAdapter() {
    override fun configure(http: HttpSecurity) {
        http
            .addFilterBefore(tokenSecurityFilter, BasicAuthenticationFilter::class.java)
            .authorizeRequests()
            .antMatchers("/graphql", "/subscriptions").permitAll()
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    }
}

@Profile("!noAuth")
@Component
class GitLabSecurityFilter(
    val oAuth2ClientProperties: OAuth2ClientProperties
) : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        val auth = request.getHeader("Authorization")

        if (auth != null) {
            val restTemplate = RestTemplate()
            val headers = HttpHeaders().apply {
                set(HttpHeaders.AUTHORIZATION, auth)
            }

            try {
                val user = restTemplate.exchange(
                    oAuth2ClientProperties.provider["gitlab"]!!.userInfoUri,
                    HttpMethod.GET,
                    HttpEntity<MultiValueMap<String, String>>(headers),
                    GitLabUser::class.java
                ).body

                if (user != null) {
                    val securityContextHolder = SecurityContextHolder.getContext()
                    securityContextHolder.authentication = OAuth2AuthenticationToken(
                        DefaultOAuth2User(
                            AuthorityUtils.createAuthorityList("ROLE_USER"),
                            user.toMap(),
                            "username"
                        ),
                        AuthorityUtils.createAuthorityList("ROLE_USER"),
                        "gitlab"
                    )
                    request.session.setAttribute("SPRING_SECURITY_CONTEXT", securityContextHolder)
                } else {
                    response.sendError(HttpStatus.UNAUTHORIZED.value())
                }
            } catch (ex: HttpStatusCodeException) {
                logger.error("Tried to authenticate user, got ${ex.statusCode} - ${ex.localizedMessage}")
            }
        }

        filterChain.doFilter(request, response)
    }

    companion object : Logging
}

@Suppress("ConstructorParameterNaming")
data class GitLabUser(
    val username: String,
    val name: String? = null,
    val email: String? = null,
    val avatar_url: String? = null
) {
    fun toMap(): Map<String, String?> = mapOf(
        "username" to username,
        "name" to name,
        "email" to email,
        "avatar_url" to avatar_url
    )
}
