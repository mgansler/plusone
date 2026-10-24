#!/usr/bin/env node
/**
 * Generate strava-endpoints.ts from the OpenAPI spec.
 * Run: npx tsx scripts/generate-strava-endpoints.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const specPath = path.join(__dirname, '..', 'strava.json')
const spec: any = JSON.parse(fs.readFileSync(specPath, 'utf-8'))
const paths = spec.paths || {}

interface EndpointEntry {
  path: string
  summary: string
  pathParams: string[]
}

interface Group {
  name: string
  endpoints: EndpointEntry[]
}

const groups: Group[] = []

for (const [rawPath, methods] of Object.entries(paths)) {
  const m = methods as Record<string, any>
  if (!m.get?.summary) continue

  const summary = m.get.summary
  const params = (m.get.parameters || []).filter((p: any) => p.in === 'path').map((p: any) => p.name)

  let group: string
  if (rawPath.startsWith('/athlete') || rawPath === '/athlete') group = 'Athlete'
  else if (rawPath.startsWith('/activities')) group = 'Activities'
  else if (rawPath.startsWith('/routes')) group = 'Routes'
  else if (rawPath.startsWith('/segments') || rawPath.startsWith('/segment')) group = 'Segments'
  else if (rawPath.startsWith('/clubs')) group = 'Clubs'
  else if (rawPath.startsWith('/gear')) group = 'Gear'
  else if (rawPath.startsWith('/uploads')) group = 'Uploads'
  else group = 'Other'

  let g = groups.find((g) => g.name === group)
  if (!g) {
    g = { name: group, endpoints: [] }
    groups.push(g)
  }
  g.endpoints.push({ path: rawPath, summary, pathParams: params })
}

// Sort endpoints within groups alphabetically
for (const g of groups) {
  g.endpoints.sort((a, b) => a.path.localeCompare(b.path))
}

const output =
  `// This file is auto-generated from strava.json — do not edit manually.
// Run: npx tsx scripts/generate-strava-endpoints.ts

export interface StravaEndpoint {
  path: string
  summary: string
  pathParams: string[]
}

export interface StravaEndpointGroup {
  name: string
  endpoints: StravaEndpoint[]
}

export const stravaEndpointGroups: StravaEndpointGroup[] = ${JSON.stringify(
    groups.map((g) => ({ name: g.name, endpoints: g.endpoints })),
    null,
    2,
  )}
`.trimEnd() + '\n'

const outPath = path.join(__dirname, '..', 'src', 'lib', 'strava-endpoints.ts')
fs.writeFileSync(outPath, output)
console.log(
  `Generated ${outPath} (${groups.length} groups, ${groups.reduce((s, g) => s + g.endpoints.length, 0)} endpoints)`,
)
