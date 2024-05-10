## How to record a new stub

Replace `response.data` with the actual response body:

```typescript
console.log(
  JSON.stringify(
    new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@@',
    }).parse(response.data),
    null,
    2,
  ),
)
```
