import { createHash } from 'node:crypto'
import { Agent } from 'node:https'

import type { AxiosInstance } from 'axios'
import axios from 'axios'

import type { FritzBoxConfig } from '../config'
import { xmlBuilder, xmlParser } from '../services/shared'

import { type ActionArgument, tr064DescSchema } from './schema'
import { Service } from './service'

type AuthParameters = {
  Nonce: string
  Realm: string
}

export class Tr064 {
  public authParams: AuthParameters | undefined

  private constructor(
    private readonly config: FritzBoxConfig,
    private readonly services: Array<Service> = [],
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

    const mergedServiceDescriptions = [...tr064Desc.root.device.serviceList.service]
    for (const device of tr064Desc.root.device.deviceList.device) {
      mergedServiceDescriptions.push(...device.serviceList.service)
    }

    for (const serviceDescription of mergedServiceDescriptions) {
      const service = new Service({ host: config.host, port: newSecurityPort }, serviceDescription)
      await service.parseActions()
      services.push(service)
    }

    return new Tr064(config, services, axiosInstance)
  }

  public findServiceByType(serviceType: string): Service | undefined {
    return this.services.find((service) => service.isOfServiceType(serviceType))
  }

  public async callAction<OutVars extends Record<string, string | number>>(
    serviceType: string,
    actionName: string,
    inArgs: Record<string, string | number> = {},
    requiresAuth = true,
    isRetry = false,
  ): Promise<OutVars> {
    const service = this.findServiceByType(serviceType)
    if (!service) {
      throw new Error(`No service of type '${serviceType}' found.`)
    }

    const actionVars = service.findAction(actionName)

    if (!actionVars) {
      throw new Error(`Action named '${actionName}' does not exist in service '${serviceType}'.`)
    }

    actionVars.forEach((arg) => {
      if (arg.direction === 'in' && !Object.keys(inArgs).includes(arg.name)) {
        throw new Error(`Missing required inArg '${arg.name}'.`)
      }
    })

    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `${serviceType}#${actionName}`,
    }

    if (!requiresAuth) {
      const noAuthRequiredSoapResponse = await this.axiosInstance.post(
        service.controlUrl,
        this.constructNoAuthRequiredSoapEnvelope(serviceType, actionName, inArgs),
        { headers },
      )

      return this.extractOutVarsFromBody<OutVars>(
        actionVars,
        xmlParser.parse(noAuthRequiredSoapResponse.data)['s:Envelope']['s:Body'][`u:${actionName}Response`],
      )
    }

    if (!this.authParams) {
      const initChallengeSoapResponse = await this.axiosInstance.post(
        service.controlUrl,
        this.constructInitialSoapEnvelope(serviceType, actionName, inArgs),
        { headers },
      )
      const parsedData = xmlParser.parse(initChallengeSoapResponse.data)

      const challenge = parsedData['s:Envelope']['s:Header']['h:Challenge']
      if (!challenge) {
        throw new Error('Initial response contained no challenge, something went wrong.')
      }

      this.authParams = { Nonce: challenge['Nonce'], Realm: challenge['Realm'] }
    }

    const authenticatedSoapResponse = await this.axiosInstance.post(
      service.controlUrl,
      this.constructSoapEnvelope(serviceType, actionName, this.authParams, inArgs),
      { headers },
    )

    const parsedResponse = xmlParser.parse(authenticatedSoapResponse.data)
    const challenge = parsedResponse['s:Envelope']['s:Header']['h:Challenge']
    if (challenge && challenge['Status'] === 'Unauthenticated') {
      if (isRetry) {
        this.authParams = undefined
        throw new Error('Re-Authentication failed.')
      }
      this.authParams = { Nonce: challenge['Nonce'], Realm: challenge['Realm'] }
      return this.callAction(serviceType, actionName, inArgs, requiresAuth, true)
    }

    return this.extractOutVarsFromBody<OutVars>(
      actionVars,
      parsedResponse['s:Envelope']['s:Body'][`u:${actionName}Response`],
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

  private constructNoAuthRequiredSoapEnvelope(
    serviceType: string,
    actionName: string,
    inArgs: Record<string, string | number>,
  ): string {
    return xmlBuilder.build({
      '?xml': { '@@version': '1.0', '@@encoding': 'utf8' },
      's:Envelope': {
        '@@s:encodingStyle': 'http://schemas.xmlsoap.org/soap/encoding/',
        '@@xmlns:s': 'http://schemas.xmlsoap.org/soap/envelope/',
        's:Body': {
          [`u:${actionName}`]: { '@@xmlns:u': serviceType, ...inArgs },
        },
      },
    })
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

  private extractOutVarsFromBody<OutVars extends Record<string, string | number>>(
    actionVars: Array<ActionArgument>,
    soapBody: Record<string, string | number>,
  ): OutVars {
    return actionVars.reduce((outVars, variable) => {
      return variable.direction !== 'out'
        ? outVars
        : {
            ...outVars,
            [variable.name]: soapBody[variable.name],
          }
    }, {} as OutVars)
  }
}
