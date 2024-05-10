import axios from 'axios'

import { calculateMD5Response, calculatePBKDF2Response } from './authentication/challenge-reponse'
import { OnTelService } from './avm/ontel'
import { TamService } from './avm/tam'
import type { FritzBoxConfig } from './config'
import { Tr064 } from './tr064/tr064'

export type AvmServices = {
  onTel: OnTelService
  tam: TamService
}

export class FritzboxClient {
  private sid: string | undefined

  private constructor(
    private readonly config: FritzBoxConfig,
    public readonly tr064: AvmServices,
  ) {}

  static async init(config: FritzBoxConfig): Promise<FritzboxClient> {
    const tr064 = await Tr064.init(config)
    return new FritzboxClient(config, { onTel: new OnTelService(tr064), tam: new TamService(tr064) })
  }

  async login() {
    const loginUrl = `http://${this.config.host}/login_sid.lua`
    const getChallengeResponse = await axios.get(`${loginUrl}?version=2`)

    const [, blockTime] = getChallengeResponse.data.match('<BlockTime>(.*)</BlockTime>')
    if (Number(blockTime) > 0) {
      throw new Error(`You are blocked for ${blockTime} seconds, slow down!`)
    }

    const [, challenge] = getChallengeResponse.data.match('<Challenge>(.*)</Challenge>')

    const [version] = challenge.split('$')

    const loginResp =
      version === '2'
        ? await axios.post(
            `${loginUrl}?version=2`,
            {
              username: this.config.username,
              response: calculatePBKDF2Response(challenge, this.config.password),
            },
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
          )
        : await axios.get(
            `${loginUrl}?username=${this.config.username}&response=${calculateMD5Response(challenge, this.config.password)}`,
          )

    const [, sid] = loginResp.data.match('<SID>(.*)</SID>')

    if (sid === '0000000000000000') {
      throw new Error('Could not get SID, check your credentials.')
    }

    this.sid = sid
  }
}
