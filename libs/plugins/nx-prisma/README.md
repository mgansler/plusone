# Nx Plugin for prisma

This plugin helps with the usage of [Prisma](https://www.prisma.io) in a Nx workspace.

## How to use

Put this into `targets` of your `project.json`.

```json
{
  "format": {
    "executor": "@mgansler/nx-prisma:format"
  },
  "generate": {
    "executor": "@mgansler/nx-prisma:generate"
  }
}
```

Your schema should be located at `<sourceRoot>/libs/schema.prisma`

Running `nx run <projectName>:generate` will generate the Prisma client under `libs/client`. This directory can be added
to your `.gitignore`.

You may want a `src/index.ts` with the following content:

```typescript
export * from './lib/client/index'
```

Also, don't forget to add `"src/lib/client/**"` to the `ignorePatterns` of your `.eslintrc.json`.

## Options

`schema`: Path to `schema.prisma` relative to the `sourceRoot` of the application/library. Default
is `libs/schema.prisma`
