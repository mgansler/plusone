import type { Tr064 } from '../tr064/tr064'

import type { GetCallListResponse, GetPhonebookResponse } from './ontel.schemas'
import { getCallListSchema, getPhonebookSchema } from './ontel.schemas'
import type { CallListOutVars, PhonebookOutVars } from './ontel.vars'
import { xmlParser } from './shared'

export class OnTelService {
  // https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/x_contactSCPD.pdf
  public static readonly ServiceType = 'urn:dslforum-org:service:X_AVM-DE_OnTel:1'

  constructor(private readonly tr064: Tr064) {}

  public async getCallList(): Promise<GetCallListResponse> {
    const outVars = await this.tr064.callAction<CallListOutVars>(OnTelService.ServiceType, 'GetCallList')
    const response = await this.tr064.callUrlFromActionResponse(outVars['NewCallListURL'])
    return getCallListSchema.parse(xmlParser.parse(response.data))
  }

  public async getPhonebook(phonebookId = 0): Promise<GetPhonebookResponse> {
    const outVars = await this.tr064.callAction<PhonebookOutVars>(OnTelService.ServiceType, 'GetPhonebook', {
      NewPhonebookID: phonebookId,
    })
    const response = await this.tr064.callUrlFromActionResponse(outVars['NewPhonebookURL'])
    return getPhonebookSchema.parse(xmlParser.parse(response.data))
  }
}
