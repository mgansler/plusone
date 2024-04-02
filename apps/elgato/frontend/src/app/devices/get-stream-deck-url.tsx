type GetStreamDeckUrlProps = {
  macAddress: string
}

export function GetStreamDeckUrl({ macAddress }: GetStreamDeckUrlProps) {
  const copyToClipboard = async () => {
    const origin = window.origin
    await window.navigator.clipboard.writeText(`${origin}/api/public/stream-deck/toggle/${macAddress}`)
  }

  return <button onClick={copyToClipboard}>Copy to Clipboard</button>
}
