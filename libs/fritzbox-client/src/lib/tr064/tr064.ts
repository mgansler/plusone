import { createHash } from 'node:crypto'
import { Agent } from 'node:https'

import type { AxiosInstance } from 'axios'
import axios from 'axios'

import { xmlBuilder, xmlParser } from '../avm/shared'
import type { FritzBoxConfig } from '../config'

import { tr064DescSchema } from './schema'
import { Service } from './service'

type AuthParameters = {
  Nonce: string
  Realm: string
}

export class Tr064 {
  public authParams: AuthParameters | undefined

  private constructor(
    private readonly config: FritzBoxConfig,
    private services: Array<Service> = [],
    private readonly axiosInstance: AxiosInstance,
  ) {}

  static async init(config: FritzBoxConfig): Promise<Tr064> {
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

    const tr64DescXMLResponse = await axios.get(`https://${config.host}:${newSecurityPort}/tr64desc.xml`, {
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    })
    const tr064Desc = tr064DescSchema.parse(xmlParser.parse(tr64DescXMLResponse.data))

    const axiosInstance = axios.create({
      baseURL: `https://${config.host}:${newSecurityPort}`,
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
    })

    const services: Array<Service> = []
    for (const serviceDescription of tr064Desc.root.device.serviceList.service) {
      const service = new Service({ host: config.host, port: newSecurityPort }, serviceDescription)
      await service.parseActions()
      services.push(service)
    }

    return new Tr064(config, services, axiosInstance)
  }

  public findServiceByType(serviceType: string): Service | undefined {
    return this.services.find((service) => service.isOfServiceType(serviceType))
  }

  public async callAction(
    serviceType: string,
    actionName: string,
    inArgs: Record<string, string | number> = {},
    isRetry = false,
  ): Promise<Record<string, string | number>> {
    const service = this.findServiceByType(serviceType)
    if (!service) {
      throw new Error(`No service of type '${serviceType}' found.`)
    }

    const action = service.findAction(actionName)

    if (!action) {
      throw new Error(`Action named '${actionName}' does not exist in service '${serviceType}'.`)
    }

    action.forEach((arg) => {
      if (arg.direction === 'in' && !Object.keys(inArgs).includes(arg.name)) {
        throw new Error(`Missing required inArg '${arg.name}'.`)
      }
    })

    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `${serviceType}#${actionName}`,
    }

    if (!this.authParams) {
      const resp = await this.axiosInstance.post(
        service.controlUrl,
        this.constructInitialSoapEnvelope(serviceType, actionName, inArgs),
        { headers },
      )
      const parsedData = xmlParser.parse(resp.data)
      const challenge = parsedData['s:Envelope']['s:Header']['h:Challenge']

      if (!challenge) {
        throw new Error('Initial response contained no challenge, something went wrong.')
      }

      this.authParams = { Nonce: challenge['Nonce'], Realm: challenge['Realm'] }
    }

    const respWithAuth = await this.axiosInstance.post(
      service.controlUrl,
      this.constructSoapEnvelope(serviceType, actionName, this.authParams, inArgs),
      { headers },
    )

    const parsedResponse = xmlParser.parse(respWithAuth.data)
    const challenge = parsedResponse['s:Envelope']['s:Header']['h:Challenge']
    if (challenge && challenge['Status'] === 'Unauthenticated') {
      if (isRetry) {
        this.authParams = undefined
        throw new Error('Re-Authentication failed.')
      }
      this.authParams = { Nonce: challenge['Nonce'], Realm: challenge['Realm'] }
      return this.callAction(serviceType, actionName, inArgs, true)
    }

    const actionResponse = parsedResponse['s:Envelope']['s:Body'][`u:${actionName}Response`]
    return action.reduce(
      (outVars, variable) => {
        return variable.direction !== 'out'
          ? outVars
          : {
              ...outVars,
              [variable.name]: actionResponse[variable.name],
            }
      },
      {} as Record<string, string | number>,
    )
  }

  /**
   * The returned callUrl may be in the format `https://[2001:db8::1]/xxx` which would be a valid ipv6 url.
   * Unfortunately, axios tries to resolve `[2001:db8::1]` as a hostname: https://github.com/axios/axios/issues/5333.
   * Therefor we use the hostname from the config.
   */
  public async callUrlFromActionResponse(callUrl: string) {
    const url = new URL(callUrl)
    return this.axiosInstance.get(url.pathname + url.search)
  }

  private calcAuthDigest(realm: string, nonce: string): string {
    const secret = createHash('md5').update(`${this.config.username}:${realm}:${this.config.password}`).digest('hex')
    return createHash('md5').update(`${secret}:${nonce}`).digest('hex')
  }

  private constructInitialSoapEnvelope(
    serviceType: string,
    actionName: string,
    inArgs: Record<string, string | number>,
  ): string {
    return xmlBuilder.build({
      '?xml': { '@@version': '1.0', '@@encoding': 'utf8' },
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
          [`u:${actionName}`]: { '@@xmlns:u': serviceType, ...inArgs },
        },
      },
    })
  }

  private constructSoapEnvelope(
    serviceType: string,
    actionName: string,
    authParams: AuthParameters,
    inArgs: Record<string, string | number>,
  ): string {
    return xmlBuilder.build({
      '?xml': { '@@version': '1.0', '@@encoding': 'utf8' },
      's:Envelope': {
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        's:Header': {
          'h:ClientAuth': {
            '@@xmlns:h': 'http://soap-authentication.org/digest/2001/10/',
            '@@s:mustUnderstand': '1',
            UserID: this.config.username,
            Nonce: authParams.Nonce,
            Auth: this.calcAuthDigest(authParams.Realm, authParams.Nonce),
            Realm: authParams.Realm,
          },
        },
        's:Body': {
          [`u:${actionName}`]: { '@@xmlns:u': serviceType, ...inArgs },
        },
      },
    })
  }
}
