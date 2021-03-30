package de.martingansler.feeds.test.testcontainers

import org.testcontainers.containers.PostgreSQLContainer

class FeedsPostgreSQLContainer(image: String) : PostgreSQLContainer<FeedsPostgreSQLContainer>(image)
