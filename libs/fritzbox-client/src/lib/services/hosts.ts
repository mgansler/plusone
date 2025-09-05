import type { Tr064 } from '../tr064/tr064'

import type {
  GetGenericHostEntryOutVars,
  GetHostNumberOfEntriesOutVars,
  SpecificHostEntryByIpOutVars,
} from './hosts.vars'

export class HostsService {
  public static readonly ServiceType = 'urn:dslforum-org:service:Hosts:1'

  constructor(private readonly tr064: Tr064) {}

  public async getHostNumberOfEntries() {
    const outVars = await this.tr064.callAction<GetHostNumberOfEntriesOutVars>(
      HostsService.ServiceType,
      'GetHostNumberOfEntries',
      {},
      false,
    )
    return outVars
  }

  public async getGenericHostEntry(NewIndex: number) {
    const outVars = await this.tr064.callAction<GetGenericHostEntryOutVars>(
      HostsService.ServiceType,
      'GetGenericHostEntry',
      { NewIndex },
      false,
    )
    return outVars
  }

  public async getSpecificHostEntryByIp(NewIPAddress: string) {
    const outVars = await this.tr064.callAction<SpecificHostEntryByIpOutVars>(
      HostsService.ServiceType,
      'X_AVM-DE_GetSpecificHostEntryByIP',
      {
        NewIPAddress,
      },
    )
    return outVars
  }
}
