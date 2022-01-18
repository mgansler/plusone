# Nx plugin to compose targets

Often times you need to run multiple targets at the same time. This plugin helps with that. The difference
to `dependsOn` is that `compose` can handle long-running tasks.

## Example

```json
{
  "compose": {
    "executor": "@mgansler/nx-compose:compose",
    "options": {
      "targets": ["app-backend:serve", "app-web:serve"]
    },
    "configurations": {
      "production": {}
    }
  }
}
```
