# Nx plugin for Remix

## Generators

### Application

`nx generate @mgansler/nx-remix:application <app-name> [--express]`

#### Options

- `--express` (optional): Prepare the build artifact to be served via express

## Executors

### build

`nx build <app-name>`

#### Options

| Name    | Default | Options                              | Description                                                 |
| ------- | ------- | ------------------------------------ | ----------------------------------------------------------- |
| express | `false` | `true` or name of custom `server.js` | Should prepare the build artifact to be served via express. |

### serve

`nx serve <app-name>`
