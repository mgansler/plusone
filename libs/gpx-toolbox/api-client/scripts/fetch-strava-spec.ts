/**
 * Download the Strava API spec and fix Swagger 2.0 / OpenAPI 3.0 incompatibilities.
 * Run: tsx libs/gpx-toolbox/api-client/scripts/fetch-strava-spec.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = fileURLToPath(import.meta.url) // scripts/ directory
const root = join(__dir, '../../')

const output = join(root, 'strava.preprocessed.json')

async function main() {
  // ── Download ──────────────────────────────────────────────────────────

  const url = 'https://developers.strava.com/swagger/swagger.json'
  console.log(`Fetching ${url} …`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

  const spec = (await res.json()) as Record<string, unknown>
  spec.swagger = '2.0' // The playground spec is OpenAPI 3.0 — downgrade for Swagger 2.0 compatibility

  console.log(`Downloaded ${Object.keys((spec.paths as Record<string, unknown>) || {}).length} paths`)

  // ── Fix 1: Add missing parameter definitions ──────────────────────────

  const parameters = (spec.parameters as Record<string, unknown>) ?? {}
  if (!parameters.id) {
    parameters.id = { type: 'integer', name: 'id', in: 'path', required: true, description: 'ID parameter' }
    console.log('Fix: added missing `id` parameter')
  }
  if (!parameters.routeId) {
    parameters.routeId = { ...parameters.id, name: 'routeId', description: 'Route ID' }
  }
  if (!parameters.uploadId) {
    parameters.uploadId = { ...parameters.id, name: 'uploadId', description: 'Upload ID' }
  }
  spec.parameters = parameters

  // ── Fix 2: Clean up $ref parameters (remove illegal `in` property) ──

  const paths = spec.paths as Record<string, Record<string, unknown>>
  for (const [_path, methods] of Object.entries(paths)) {
    for (const [_method, details] of Object.entries(methods)) {
      const m = details as Record<string, unknown>
      if (!Array.isArray(m.parameters)) continue
      for (const param of m.parameters) {
        const p = param as Record<string, unknown>
        if (p.$ref && p.in !== undefined) {
          delete p.in
        }
      }
    }
  }

  // ── Fix 3: Convert OpenAPI 3.0 `content` → Swagger 2.0 `schema` ──────

  for (const [_path, methods] of Object.entries(paths)) {
    for (const [_method, details] of Object.entries(methods)) {
      const m = details as Record<string, unknown>
      if (typeof m.responses !== 'object' || m.responses === null) continue
      const responses = m.responses as Record<string, Record<string, unknown>>
      for (const [_code, response] of Object.entries(responses)) {
        const r = response as Record<string, unknown>
        if (r.content && typeof r.content === 'object') {
          const content = r.content as Record<string, Record<string, unknown>>
          const mimeType = Object.keys(content)[0]
          if (mimeType?.includes('xml') || mimeType?.includes('octet-stream') || mimeType?.includes('zip')) {
            r.schema = { type: 'string', format: 'binary' }
          } else {
            const json = content['application/json']
            if (json?.schema) {
              r.schema = json.schema
            }
          }
          delete r.content
        }
      }
    }
  }

  // ── Fix 4: Fix path params that reference non-existent path segments ─

  for (const [_path, methods] of Object.entries(paths)) {
    const pathParams = [...(_path.matchAll(/\{(\w+)\}/g) || [])].map((m) => m[1])
    for (const [_method, details] of Object.entries(methods)) {
      const m = details as Record<string, unknown>
      if (typeof m !== 'object' || !m.parameters) continue
      for (const param of m.parameters) {
        const p = param as Record<string, unknown>
        const name = (
          p.$ref ? (parameters as Record<string, unknown>)?.[p.$ref.split('/').pop() as string]?.name : p.name
        ) as string | undefined
        if (p.in === 'path' && name && !pathParams.includes(name)) {
          p.in = 'query'
          console.log(`Fix: changed \`${name}\`.in from path to query (no {${name}} in ${_path})`)
        }
      }
    }
  }

  // ── Fix 5: Add missing path params at operation level ─────────────────

  for (const [_path, methods] of Object.entries(paths)) {
    const pathParams = [...(_path.matchAll(/\{(\w+)\}/g) || [])].map((m) => m[1])
    for (const [_method, details] of Object.entries(methods)) {
      const m = details as Record<string, unknown>
      if (typeof m !== 'object' || !m.parameters) continue
      const params = m.parameters as Array<Record<string, unknown>>
      const declared = new Set(params.map((p: Record<string, unknown>) => p.name))
      for (const pp of pathParams) {
        if (!declared.has(pp)) {
          const def = parameters[pp]
          if (def) {
            params.push({ $ref: '#/parameters/' + pp })
          }
        }
      }
    }
  }

  // ── Fix 6: Remove external $refs (resolve inlined) ───────────────────

  for (const [_path, methods] of Object.entries(paths)) {
    for (const [_method, details] of Object.entries(methods)) {
      const m = details as Record<string, unknown>
      if (typeof m.responses !== 'object') continue
      const responses = m.responses as Record<string, Record<string, unknown>>
      for (const [_code, response] of Object.entries(responses)) {
        const r = response as Record<string, unknown>
        if (r.schema && typeof r.schema === 'object' && (r.schema as Record<string, unknown>).$ref) {
          const ref = (r.schema as Record<string, unknown>).$ref as string
          if (ref.startsWith('http')) {
            // Remove external refs — Orval will inline what it can
            delete r.schema
          }
        }
      }
    }
  }

  writeFileSync(output, JSON.stringify(spec, null, 2), 'utf-8')
  console.log(`Written preprocessed spec to ${output}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
