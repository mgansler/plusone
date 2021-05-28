import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { OperationDefinitionNode } from 'graphql'

import { readToken } from '../components/authentication/tokens'

const authLink = setContext((_, { headers }) => {
  const token = readToken()

  return {
    headers: {
      ...headers,
      authorization: token ? `${token.token_type} ${token.access_token}` : '',
    },
  }
})

const wsLink = new WebSocketLink({
  uri:
    process.env.NODE_ENV === 'development'
      ? `ws://${window.location.hostname}:8080/subscriptions`
      : `wss://${window.location.hostname}/subscriptions`,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: {
      authToken: readToken()?.access_token,
    },
  },
})

const httpLink = new HttpLink({
  uri: process.env.NODE_ENV === 'test' ? 'http://localhost/graphql' : '/graphql',
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
        )
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`)
      }
    }),
    authLink,
    link,
  ]),
  cache: new InMemoryCache({
    dataIdFromObject: (object) => object.id,
  }),
  connectToDevTools: true,
})
