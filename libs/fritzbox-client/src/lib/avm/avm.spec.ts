import { setupServer } from 'msw/node'
import { beforeEach, expect } from 'vitest'

import { deviceinfoXml } from '../stubs/deviceinfo.xml.spec'
import { tr64descXmlSpec } from '../stubs/tr64desc.xml.spec'
import {
  x_contactCallList_oneEntry,
  x_contactCallList_twoEntries,
  x_contactGetCallListXmlSpec,
} from '../stubs/x_contactGetCallList.xml.spec'
import { x_contactGetPhonebookXmlSpec, x_contactPhonebook } from '../stubs/x_contactGetPhonebook.xml.spec'
import { x_contactSCPDXmlSpec } from '../stubs/x_contactSCPD.xml.spec'
import {
  x_tamGetMessageListXmlSpec,
  x_tamMessageList_oneEntry,
  x_tamMessageList_twoEntries,
} from '../stubs/x_tamGetMessageList.xml.spec'
import { x_tamSCPDXmlSpec } from '../stubs/x_tamSCPD.xml.spec'
import { Tr064 } from '../tr064/tr064'

import { OnTelService } from './ontel'
import { TamService } from './tam'

describe('AvmServices', () => {
  const server = setupServer(
    tr64descXmlSpec,
    deviceinfoXml,
    x_contactSCPDXmlSpec, // OnTel
    x_tamSCPDXmlSpec, // TAM
  )
  let tr064: Tr064

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' })
    tr064 = await Tr064.init({ host: 'fritz-test.box', username: 'admin', password: 'gurkensalat' })
  })

  afterAll(() => {
    server.close()
  })

  describe('X_AVM-DE_OnTel', () => {
    let onTelService: OnTelService

    beforeEach(() => {
      onTelService = new OnTelService(tr064)
    })

    describe('getCallList', () => {
      it('should return a call list with a single entry', async () => {
        server.use(x_contactGetCallListXmlSpec, x_contactCallList_oneEntry)

        const callList = await onTelService.getCallList()
        expect(callList.root.Call).toHaveLength(1)
        expect(callList.root.Call[0]).toMatchSnapshot()
      })

      it('should retrieve the call list', async () => {
        server.use(x_contactGetCallListXmlSpec, x_contactCallList_twoEntries)
        const callList = await onTelService.getCallList()

        expect(callList.root.Call).toHaveLength(2)
        expect(callList.root.Call[0]).toMatchSnapshot()
        expect(callList.root.Call[1]).toMatchSnapshot()
      })
    })

    describe('getPhonebook', () => {
      it('should get the phonebook', async () => {
        server.use(x_contactGetPhonebookXmlSpec, x_contactPhonebook)

        const phonebook = await onTelService.getPhonebook()
        expect(phonebook.phonebooks.phonebook.contact).toHaveLength(12)
        expect(phonebook.phonebooks.phonebook.contact).toMatchSnapshot()
      })
    })
  })

  describe('X_AVM-DE_TAM', () => {
    let tamService: TamService

    beforeEach(() => {
      tamService = new TamService(tr064)
    })

    it('should retrieve the message list with one entry', async () => {
      server.use(x_tamGetMessageListXmlSpec, x_tamMessageList_oneEntry)

      const messageList = await tamService.getMessageList()

      expect(messageList.Root.Message).toHaveLength(1)
      expect(messageList.Root.Message[0]).toMatchSnapshot()
    })

    it('should retrieve the message list with two entries', async () => {
      server.use(x_tamGetMessageListXmlSpec, x_tamMessageList_twoEntries)

      const messageList = await tamService.getMessageList()

      expect(messageList.Root.Message).toHaveLength(2)
      expect(messageList.Root.Message[0]).toMatchSnapshot()
      expect(messageList.Root.Message[1]).toMatchSnapshot()
    })
  })
})
