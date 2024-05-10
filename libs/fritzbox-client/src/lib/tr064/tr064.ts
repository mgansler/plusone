import { createHash } from 'node:crypto'
import { Agent } from 'node:https'

import type { AxiosInstance } from 'axios'
import axios from 'axios'

import { xmlBuilder, xmlParser } from '../avm/shared'
import type { FritzBoxConfig } from '../config'

import { Device } from './device'
import { tr064DescSchema } from './schema'

export class Tr064 {
  private constructor(
    private readonly config: FritzBoxConfig,
    private readonly device: Device,
    private readonly axiosInstance: AxiosInstance,
  ) {}

  static async init(config: FritzBoxConfig): Promise<Tr064> {
    const tr64DescXMLResponse = await axios.get(`http://${config.host}:49000/tr64desc.xml`)

    const tr064Desc = tr064DescSchema.parse(xmlParser.parse(tr64DescXMLResponse.data))

    const device = new Device(config, tr064Desc.root.device)
    await device.parseServices()

    const securityPortResponse = await axios.post(
      `http://${config.host}:49000/upnp/control/deviceinfo`,
      xmlBuilder.build({
        's:Envelope': {
          '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
          's:Body': {
            'u:GetSecurityPort': { '@@xmlns:u': 'urn:dslforum-org:service:DeviceInfo:1' },
          },
        },
      }),
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: 'urn:dslforum-org:service:DeviceInfo:1#GetSecurityPort',
        },
      },
    )

    const newSecurityPort = xmlParser.parse(securityPortResponse.data)['s:Envelope']['s:Body'][
      'u:GetSecurityPortResponse'
    ]['NewSecurityPort']

    if (typeof newSecurityPort !== 'number') {
      throw new Error('Failed to retrieve security port.')
    }

    const axiosInstance = axios.create({
      baseURL: `https://${config.host}:${newSecurityPort}`,
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    })

    return new Tr064(config, device, axiosInstance)
  }

  async makeCall(serviceType: string, actionName: string, inArgs: Record<string, string> = {}) {
    const service = this.device?.findServiceByType(serviceType)
    if (!service) {
      throw new Error(`No service of type '${serviceType}' found.`)
    }

    const action = service.findAction(actionName)

    if (!action) {
      throw new Error(`No action named '${actionName}' found.`)
    }

    try {
      const resp = await this.axiosInstance.post(
        service.controlUrl(),
        this.constructInitialSoapEnvelope(serviceType, actionName),
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: `${serviceType}#${actionName}`,
          },
        },
      )
      const parsedData = xmlParser.parse(resp.data)
      const challenge = parsedData['s:Envelope']['s:Header']['h:Challenge']

      if (challenge) {
        const nonce = challenge['Nonce']
        const realm = challenge['Realm']

        const respWithAuth = await this.axiosInstance.post(
          service.controlUrl(),
          this.constructSoapEnvelope(serviceType, actionName, { nonce, realm }, inArgs),
          {
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              SOAPAction: `${serviceType}#${actionName}`,
            },
          },
        )

        return xmlParser.parse(respWithAuth.data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  private calcAuthDigest(realm: string, nonce: string): string {
    const secret = createHash('md5').update(`${this.config.username}:${realm}:${this.config.password}`).digest('hex')
    return createHash('md5').update(`${secret}:${nonce}`).digest('hex')
  }

  private constructInitialSoapEnvelope(serviceType: string, actionName: string): string {
    return xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'utf8',
      },
      's:Envelope': {
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        's:Header': {
          'h:InitChallenge': {
            '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
            '@@s:mustUnderstand': '1',
            UserID: this.config.username,
          },
        },
        's:Body': {
          [`u:${actionName}`]: { '@@xmlns:u': serviceType },
        },
      },
    })
  }

  private constructSoapEnvelope(
    serviceType: string,
    actionName: string,
    auth: {
      nonce: string
      realm: string
    },
    inArgs: Record<string, string> = {},
  ): string {
    return xmlBuilder.build({
      '?xml': {
        '@@version': '1.0',
        '@@encoding': 'utf8',
      },
      's:Envelope': {
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        's:Header': {
          'h:ClientAuth': {
            '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
            '@@s:mustUnderstand': '1',
            UserID: this.config.username,
            Nonce: auth.nonce,
            Auth: this.calcAuthDigest(auth.realm, auth.nonce),
            Realm: auth.realm,
          },
        },
        's:Body': {
          [`u:${actionName}`]: { '@@xmlns:u': serviceType, ...inArgs },
        },
      },
    })
  }
}
