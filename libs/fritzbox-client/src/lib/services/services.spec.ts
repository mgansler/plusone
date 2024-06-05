import { setupServer } from 'msw/node'
import { beforeEach, expect } from 'vitest'

import { deviceinfoXml } from '../stubs/deviceinfo.xml.spec'
import { hostsXmlSpec } from '../stubs/hosts.xml.spec'
import { hostsGetGenericHostEntrySpec } from '../stubs/hostsGetGenericHostEntry.spec'
import { hostsGetHostNumberOfEntriesSpec } from '../stubs/hostsGetHostNumberOfEntries.spec'
import { hostsGetSpecificHostEntrySpec } from '../stubs/hostsGetSpecificHostEntry.spec'
import { tr64descXmlSpec } from '../stubs/tr64desc.xml.spec'
import { wancommonifconfigGetActiveProviderXmlSpec } from '../stubs/wancommonifconfigGetActiveProvider.xml.spec'
import { wancommonifconfigGetOnlineMonitorXmlSpec } from '../stubs/wancommonifconfigGetOnlineMonitor.xml.spec'
import { wancommonifconfigGetTotalBytesReceivedXmlSpec } from '../stubs/wancommonifconfigGetTotalBytesReceived.xml.spec'
import { wancommonifconfigGetTotalBytesSentXmlSpec } from '../stubs/wancommonifconfigGetTotalBytesSent.xml.spec'
import { wancommonifconfigSCPDXmlSpec } from '../stubs/wancommonifconfigSCPD.xml.spec'
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

import { HostsService } from './hosts'
import { OnTelService } from './ontel'
import { TamService } from './tam'
import { WanCommonInterfaceConfigService } from './wan-common-interface-config'

describe('Services', () => {
  const server = setupServer(
    tr64descXmlSpec,
    deviceinfoXml,
    hostsXmlSpec,
    wancommonifconfigSCPDXmlSpec, // WanCommonInterfaceConfig
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

  describe('Hosts', () => {
    let hostsService: HostsService

    beforeEach(() => {
      hostsService = new HostsService(tr064)
    })

    it('should return the number of known hosts', async () => {
      server.use(hostsGetHostNumberOfEntriesSpec)

      const numberOfHosts = await hostsService.getHostNumberOfEntries()

      expect(numberOfHosts).toMatchSnapshot()
    })

    it('should return a generic host entry', async () => {
      server.use(hostsGetGenericHostEntrySpec)

      const genericHostEntry = await hostsService.getGenericHostEntry(0)

      expect(genericHostEntry).toMatchSnapshot()
    })

    it('should return a specific host entry by ip', async () => {
      server.use(hostsGetSpecificHostEntrySpec)

      const specificHostEntry = await hostsService.getSpecificHostEntryByIp('127.0.0.1')

      expect(specificHostEntry).toMatchSnapshot()
    })
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

  describe('WanCommonInterfaceConfig', () => {
    let wanCommonInterfaceConfigService: WanCommonInterfaceConfigService

    beforeEach(() => {
      wanCommonInterfaceConfigService = new WanCommonInterfaceConfigService(tr064)
    })

    it('should get the active provider', async () => {
      server.use(wancommonifconfigGetActiveProviderXmlSpec)

      const activeProvider = await wanCommonInterfaceConfigService.getActiveProvider()

      expect(activeProvider).toMatchSnapshot()
    })

    it('should get the online monitor', async () => {
      server.use(wancommonifconfigGetOnlineMonitorXmlSpec)

      const onlineMonitor = await wanCommonInterfaceConfigService.getOnlineMonitor(0)

      expect(onlineMonitor).toMatchSnapshot()
    })

    it('should get the total bytes received', async () => {
      server.use(wancommonifconfigGetTotalBytesReceivedXmlSpec)

      const totalBytesReceived = await wanCommonInterfaceConfigService.getTotalBytesReceived()

      expect(totalBytesReceived).toMatchSnapshot()
    })

    it('should get the total bytes sent', async () => {
      server.use(wancommonifconfigGetTotalBytesSentXmlSpec)

      const totalBytesSent = await wanCommonInterfaceConfigService.getTotalBytesSent()

      expect(totalBytesSent).toMatchSnapshot()
    })
  })
})
