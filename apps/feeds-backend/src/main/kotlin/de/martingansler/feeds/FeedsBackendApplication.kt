package de.martingansler.feeds

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class FeedsBackendApplication

fun main(args: Array<String>) {
	runApplication<FeedsBackendApplication>(*args)
}
