import { RouteHandlerController } from 'cypress/types/net-stubbing'

export function mapGraphqlResponse(req: Parameters<RouteHandlerController>[0], mapping: Record<string, unknown>) {
  for (const queryString in mapping) {
    if (
      req.body.query.includes(queryString) ||
      (req.body.variables?.queryString && req.body.variables.queryString.includes(queryString))
    ) {
      req.reply(mapping[queryString])
    }
  }
}
