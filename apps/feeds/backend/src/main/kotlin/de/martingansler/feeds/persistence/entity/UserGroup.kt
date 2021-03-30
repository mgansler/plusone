package de.martingansler.feeds.persistence.entity

import org.hibernate.annotations.Type
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToMany

@Entity
data class UserGroup(
    @Id
    @GeneratedValue
    @Type(type = "pg-uuid")
    val id: UUID = UUID.randomUUID(),

    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: User,

    @Column
    val name: String,

    @OneToMany(cascade = [CascadeType.ALL], mappedBy = "group", fetch = FetchType.EAGER)
    val feeds: MutableList<UserFeed> = mutableListOf()
)
