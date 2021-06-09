import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

object DependencyVersions {
  const val GraphQl = "11.0.0"
  const val Jsoup = "1.13.1"
  const val Log4j = "1.0.0"
  const val Rome = "1.15.0"
  const val TestContainers = "1.15.1"
}

plugins {
  id("org.springframework.boot") version "2.4.4"
  id("io.spring.dependency-management") version "1.0.11.RELEASE"
  id("com.github.ben-manes.versions") version "0.36.0"

  kotlin("jvm") version "1.4.31"
  kotlin("plugin.spring") version "1.4.31"
  kotlin("plugin.jpa") version "1.4.30"
  kotlin("kapt") version "1.4.30"
  id("org.jetbrains.kotlin.plugin.noarg") version "1.4.30"
}

group = "de.martingansler"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_11

repositories {
  mavenCentral()
  jcenter()

}

dependencies {
  // Spring
  implementation("org.springframework.boot:spring-boot-starter")
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-client")
  implementation("org.springframework.security.oauth.boot:spring-security-oauth2-autoconfigure:2.4.2")
  kapt("org.springframework.boot:spring-boot-configuration-processor")

  // Database
  implementation("org.flywaydb:flyway-core")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  runtimeOnly("org.postgresql:postgresql")

  // RSS
  implementation("com.rometools:rome:${DependencyVersions.Rome}")
  implementation("com.rometools:rome-opml:${DependencyVersions.Rome}")

  // HTML
  implementation("org.jsoup:jsoup:${DependencyVersions.Jsoup}")

  // GraphQL
  implementation("com.graphql-java-kickstart:graphql-spring-boot-starter:${DependencyVersions.GraphQl}")
  implementation("com.graphql-java-kickstart:graphiql-spring-boot-starter:${DependencyVersions.GraphQl}")
  implementation("com.graphql-java-kickstart:voyager-spring-boot-starter:${DependencyVersions.GraphQl}")
  implementation("com.zhokhov.graphql:graphql-datetime-spring-boot-starter:4.0.0")
  testImplementation("com.graphql-java-kickstart:graphql-spring-boot-starter-test:${DependencyVersions.GraphQl}")
  implementation("io.reactivex.rxjava2:rxjava:2.2.20")
  // Kotlin stuff
  implementation("org.jetbrains.kotlin:kotlin-reflect")
  implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")

  // Logging
  implementation("org.apache.logging.log4j:log4j-api-kotlin:${DependencyVersions.Log4j}")

  // Testing
  testImplementation("org.springframework.boot:spring-boot-starter-test") {
    exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
  }

  // Testcontainers
  testImplementation("org.testcontainers:testcontainers:${DependencyVersions.TestContainers}")
  testImplementation("org.testcontainers:junit-jupiter:${DependencyVersions.TestContainers}")
  testImplementation("org.testcontainers:postgresql:${DependencyVersions.TestContainers}")
}

tasks.withType<KotlinCompile> {
  kotlinOptions {
    freeCompilerArgs = listOf("-Xjsr305=strict")
    jvmTarget = "11"
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}

springBoot {
  buildInfo()
}

kapt {
  useBuildCache = false
}
