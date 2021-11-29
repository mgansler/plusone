# Remix plugin for Nx

## serve

Works standalone and for End-2-End tests.

Just replace the `serve` target with this:

```json
{
  "...": "...",
  "targets": {
    "...": "...",
    "serve": {
      "executor": "@mgansler/nx-remix:serve"
    }
  }
}
```
