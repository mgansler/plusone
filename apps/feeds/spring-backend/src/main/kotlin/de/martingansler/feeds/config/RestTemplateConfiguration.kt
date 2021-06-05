package de.martingansler.feeds.config

import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate
import java.time.Duration.ofSeconds

@Configuration
class RestTemplateConfiguration {
    @Bean
    @Suppress("MagicNumber")
    fun restTemplate(): RestTemplate = RestTemplateBuilder()
        .setConnectTimeout(ofSeconds(5))
        .setReadTimeout(ofSeconds(30))
        .build()
}
