package de.martingansler.feeds.test.testcontainers

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.annotation.DirtiesContext
import org.springframework.test.context.ContextConfiguration

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ContextConfiguration(initializers = [PostgreSQLContainerInitializer::class])
@DirtiesContext
annotation class PostgreSQLIntegrationTest
