package de.martingansler.feeds.test.stubs

import de.martingansler.feeds.persistence.entity.User

object UserEntityStub {
    fun create(username: String = "demo user") =
        User(username = username)
}
