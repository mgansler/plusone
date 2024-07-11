# Plusone

![main](https://github.com/mgansler/plusone/actions/workflows/main.yml/badge.svg)

## Apps

### Advent of Code 2021

My run at [Advent of Code](https://adventofcode.com/2021). Deployed at https://aoc-21.martingansler.de.

### App Suite

A collection of utilities, all apps are lazy loaded.

- Dinner Plan

### Feeds

A RSS feed reader.

### GitHub Status Pipeline

A simple dashboard to keep multiple repositories in check.

## Nx Plugins

### @mgansler/nx-cypress-ct

Generates the configuration for Cypress component testing. Available
on [npmjs.com](https://www.npmjs.com/package/@mgansler/nx-cypress-ct).

## Packages

### @mgansler/cypress-graphql

A wrapper around `cy.intercept` that makes intercepting GraphQL calls easier. Available
on [npmjs.com](https://www.npmjs.com/package/@mgansler/cypress-graphql).

## Ports

| App                    | Frontend                      | Backend | Other                  |
| ---------------------- | ----------------------------- | ------- | ---------------------- |
| advent-of-code-2021    | [4100](http://localhost:4100) | 4100    |                        |
| elgato                 | [4101](http://localhost:4101) | 3101    |                        |
| feeds                  | [4102](http://localhost:4102) | 3333    | 3334 (Dumm RSS Server) |
| github-pipeline-status | [4103](http://localhost:4103) |         |                        |
| stgtrails              | [4104](http://localhost:4104) | 3104    |                        |
| suite                  | [4105](http://localhost:4105) |         |                        |
