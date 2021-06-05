package de.martingansler.feeds.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "feeds")
data class FeedsConfig(
    val interval: Int
)
