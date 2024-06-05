import type { Tr064 } from '../tr064/tr064'

import { xmlParser } from './shared'
import type { GetMessageListResponse } from './tam.schema'
import { getMessageListSchema } from './tam.schema'
import type { MessageListOutVars } from './tam.vars'

export class TamService {
  public static ServiceType = 'urn:dslforum-org:service:X_AVM-DE_TAM:1'

  constructor(private readonly tr064: Tr064) {}

  public async getMessageList(): Promise<GetMessageListResponse> {
    const outVars = await this.tr064.callAction<MessageListOutVars>(TamService.ServiceType, 'GetMessageList', {
      NewIndex: '0',
    })
    const response = await this.tr064.callUrlFromActionResponse(outVars['NewURL'])
    return getMessageListSchema.parse(xmlParser.parse(response.data))
  }
}
