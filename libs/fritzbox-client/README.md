# fritzbox-client

https://avm.de/service/schnittstellen/

## Testing

### Running against a real device

Create a file `src/lib/real-device.spec.ts` with the following content:

```typescript
import { FritzboxClient } from './fritzbox-client'

it('should use the real device', async () => {
  const fritzboxClient = await FritzboxClient.init({
    host: 'fritz.box',
    username: '<replace-with-real-username>',
    password: '<replace-with-real-password>',
  })
  try {
    // Replace with call you want to test/implement
    const result = await fritzboxClient.tr064.onTel.getPhonebook()
  } catch (e) {
    console.log(e)
  }
})
```

This file is in the `.gitignore` to avoid checking in real credentials, so it can be left there.
Running a call against a real device is helpful for recording stubs:

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
