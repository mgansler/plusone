export type GetHostNumberOfEntriesOutVars = {
  NewHostNumberOfEntries: number
}

export type GetGenericHostEntryOutVars = {
  NewIPAddress: string
  NewAddressSource: string
  NewLeaseTimeRemaining: number
  NewMACAddress: string
  NewInterfaceType: string
  NewActive: number
  NewHostName: string
}

export type SpecificHostEntryByIpOutVars = {
  NewMACAddress: string
  NewActive: number
  NewHostName: string
  NewInterfaceType: string
  'NewX_AVM-DE_Port': number
  'NewX_AVM-DE_Speed': number
  'NewX_AVM-DE_UpdateAvailable': number
  'NewX_AVM-DE_UpdateSuccessful': string
  'NewX_AVM-DE_InfoURL': string
  'NewX_AVM-DE_MACAddressList': string
  'NewX_AVM-DE_Model': string
  'NewX_AVM-DE_URL': string
  'NewX_AVM-DE_Guest': number
  'NewX_AVM-DE_RequestClient': number
  'NewX_AVM-DE_VPN': number
  'NewX_AVM-DE_WANAccess': string
  'NewX_AVM-DE_Disallow': number
  'NewX_AVM-DE_IsMeshable': number
  'NewX_AVM-DE_Priority': number
  'NewX_AVM-DE_FriendlyName': string
  'NewX_AVM-DE_FriendlyNameIsWriteable': number
}
