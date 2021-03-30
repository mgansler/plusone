package de.martingansler.feeds.test.testcontainers

import org.springframework.boot.test.util.TestPropertyValues
import org.springframework.context.ApplicationContextInitializer
import org.springframework.context.ConfigurableApplicationContext
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers
import java.time.Duration

@Testcontainers
class PostgreSQLContainerInitializer : ApplicationContextInitializer<ConfigurableApplicationContext> {
    override fun initialize(applicationContext: ConfigurableApplicationContext) {
        container.start()

        TestPropertyValues.of(
            "spring.datasource.url=${container.jdbcUrl}",
            "spring.datasource.username=${container.username}",
            "spring.datasource.password=${container.password}"
        ).applyTo(applicationContext.environment)
    }

    companion object {
        @Container
        val container = FeedsPostgreSQLContainer("postgres")
            .withDatabaseName("feeds_test")
            .withUsername("username")
            .withPassword("let_me_in")
            .withStartupTimeout(Duration.ofSeconds(30))
    }
}
