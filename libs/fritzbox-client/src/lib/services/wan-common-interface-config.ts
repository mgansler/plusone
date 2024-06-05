import type { Tr064 } from '../tr064/tr064'

import type {
  ActiveProviderOutVars,
  OnlineMonitorOutVars,
  TotalBytesReceivedOutVars,
  TotalBytesSentOutVars,
} from './wan-common-interface-config.vars'

export class WanCommonInterfaceConfigService {
  public static ServiceType = 'urn:dslforum-org:service:WANCommonInterfaceConfig:1'

  constructor(private readonly tr064: Tr064) {}

  public async getActiveProvider() {
    const outVars = await this.tr064.callAction<ActiveProviderOutVars>(
      WanCommonInterfaceConfigService.ServiceType,
      'X_AVM-DE_GetActiveProvider',
    )
    return outVars
  }

  public async getOnlineMonitor(NewSyncGroupIndex: number) {
    const outVars = await this.tr064.callAction<OnlineMonitorOutVars>(
      WanCommonInterfaceConfigService.ServiceType,
      'X_AVM-DE_GetOnlineMonitor',
      { NewSyncGroupIndex },
    )
    return outVars
  }

  public async getTotalBytesReceived() {
    const outVars = await this.tr064.callAction<TotalBytesReceivedOutVars>(
      WanCommonInterfaceConfigService.ServiceType,
      'GetTotalBytesReceived',
    )
    return this.bytesToHuman(outVars['NewTotalBytesReceived'])
  }

  public async getTotalBytesSent() {
    const outVars = await this.tr064.callAction<TotalBytesSentOutVars>(
      WanCommonInterfaceConfigService.ServiceType,
      'GetTotalBytesSent',
    )
    return this.bytesToHuman(outVars['NewTotalBytesSent'])
  }

  private bytesToHuman(bytes: number) {
    return {
      bytes: bytes,
      kiloBytes: Math.round((bytes / 1024) * 100) / 100,
      megaBytes: Math.round((bytes / 1024 / 1024) * 100) / 100,
      gigaBytes: Math.round((bytes / 1024 / 1024 / 1024) * 100) / 100,
    }
  }
}
