import type { SetupServer } from 'msw/node'
import { setupServer } from 'msw/node'
import { afterEach, beforeEach, expect } from 'vitest'

import { Tr064 } from '../tr064/tr064'

import { OnTelService } from './ontel'
import { deviceinfoXml } from './stubs/deviceinfo.xml.spec'
import { tr64descXmlSpec } from './stubs/tr64desc.xml.spec'
import { x_contactCallList, x_contactGetCallListXmlSpec } from './stubs/x_contactGetCallList.xml.spec'
import { x_contactSCPDXmlSpec } from './stubs/x_contactSCPD.xml.spec'
import { x_tamGetMessageListXmlSpec, x_tamMessageList } from './stubs/x_tamGetMessageList.xml.spec'
import { x_tamSCPDXmlSpec } from './stubs/x_tamSCPD.xml.spec'
import { TamService } from './tam'

describe('AvmServices', () => {
  let server: SetupServer
  let tr064: Tr064

  beforeEach(async () => {
    server = setupServer(
      tr64descXmlSpec,
      deviceinfoXml,
      // OnTel
      x_contactSCPDXmlSpec,
      x_contactGetCallListXmlSpec,
      x_contactCallList,
      // TAM
      x_tamSCPDXmlSpec,
      x_tamGetMessageListXmlSpec,
      x_tamMessageList,
    )

    server.listen({ onUnhandledRequest: 'error' })
    tr064 = await Tr064.init({ host: 'fritz-test.box', username: 'admin', password: 'gurkensalat' })
  })

  afterEach(() => {
    server.close()
  })

  describe('X_AVM-DE_OnTel', () => {
    let onTelService: OnTelService

    beforeEach(() => {
      onTelService = new OnTelService(tr064)
    })

    it('should retrieve the call list', async () => {
      const callList = await onTelService.getCallList()

      expect(callList.root.Call).toHaveLength(2)
      expect(callList.root.Call[0]).toMatchInlineSnapshot(`
        {
          "Called": "SIP: 123456789",
          "Caller": 987654321,
          "Count": "",
          "Date": 2000-12-23T23:00:00.000Z,
          "Device": "FRITZ!Fon C5",
          "Duration": "0:05",
          "Id": 2,
          "Name": "Somebody I know",
          "Numbertype": "sip",
          "Path": "",
          "Port": 10,
          "Type": 1,
        }
      `)
      expect(callList.root.Call[1]).toMatchInlineSnapshot(`
        {
          "Called": "SIP: 123456789",
          "Caller": 987654321,
          "Count": "",
          "Date": 2000-12-22T23:00:00.000Z,
          "Device": "",
          "Duration": "0:00",
          "Id": 1,
          "Name": "",
          "Numbertype": "sip",
          "Path": "",
          "Port": -1,
          "Type": 2,
        }
      `)
    })
  })

  describe('X_AVM-DE_TAM', () => {
    let tamService: TamService

    beforeEach(() => {
      tamService = new TamService(tr064)
    })

    it('should retrieve the message list', async () => {
      const messageList = await tamService.getMessageList()

      expect(messageList.Root.Message).toHaveLength(2)
      expect(messageList.Root.Message[0]).toMatchInlineSnapshot(`
        {
          "Called": 123456789,
          "Date": 2000-12-23T23:00:00.000Z,
          "Duration": "0:01",
          "Index": 1,
          "Name": "",
          "New": true,
          "Path": "/download.lua?path=/data/tam/rec/rec.0.001",
          "Tam": 0,
          "inBook": false,
        }
      `)
      expect(messageList.Root.Message[1]).toMatchInlineSnapshot(`
        {
          "Called": 123456789,
          "Date": 2000-12-22T23:00:00.000Z,
          "Duration": "0:01",
          "Index": 0,
          "Name": "Somebody I know",
          "New": false,
          "Path": "/download.lua?path=/data/tam/rec/rec.0.000",
          "Tam": 0,
          "inBook": true,
        }
      `)
    })
  })
})
