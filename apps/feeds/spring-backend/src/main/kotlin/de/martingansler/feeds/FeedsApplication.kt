package de.martingansler.feeds

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
class FeedsApplication

fun main(args: Array<String>) {
    runApplication<FeedsApplication>(*args)
}
