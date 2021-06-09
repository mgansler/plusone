package de.martingansler.feeds.config

import de.martingansler.feeds.persistence.repository.UserRepository
import org.apache.logging.log4j.kotlin.Logging
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
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
import org.springframework.web.filter.OncePerRequestFilter
import javax.servlet.FilterChain
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Profile("noAuth")
@Configuration
@EnableGlobalMethodSecurity(securedEnabled = true, prePostEnabled = true)
class NoAuthSecurityConfiguration(val tokenSecurityFilter: NoAuthSecurityfilter) : WebSecurityConfigurerAdapter() {
    override fun configure(http: HttpSecurity) {
        http
            .addFilterBefore(tokenSecurityFilter, BasicAuthenticationFilter::class.java)
            .authorizeRequests()
            .antMatchers("/graphql").permitAll()
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
    }
}

@Profile("noAuth")
@Component
class NoAuthSecurityfilter(val userRepository: UserRepository) : OncePerRequestFilter() {
    override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
        logger.debug("NoAuth profile is active!")

        val demoUsername = userRepository.findAll()[0]?.username ?: "demo_user"

        val user = GitLabUser(username = demoUsername)

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

        filterChain.doFilter(request, response)
    }

    companion object : Logging
}
