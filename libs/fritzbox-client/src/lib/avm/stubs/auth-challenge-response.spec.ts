export const authChallengeResponseSpec = {
  '?xml': {
    '@@version': '1.0',
  },
  's:Envelope': {
    's:Header': {
      'h:Challenge': {
        Status: 'Unauthenticated',
        Nonce: '1122334455667788',
        Realm: 'F!Box SOAP-Auth',
        '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
        '@@s:mustUnderstand': '1',
      },
    },
    's:Body': {
      's:Fault': {
        faultcode: 's:Client',
        faultstring: 'UPnPError',
        detail: {
          UPnPError: {
            errorCode: 503,
            errorDescription: 'Auth. failed',
            '@@xmlns': 'urn:dslforum-org:control-1-0',
          },
        },
      },
    },
    '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
    '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
  },
}
