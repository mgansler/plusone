type GetStreamDeckUrlProps = {
  deviceId: string
}

export function GetStreamDeckUrl({ deviceId }: GetStreamDeckUrlProps) {
  const copyToClipboard = async () => {
    const origin = window.origin
    await window.navigator.clipboard.writeText(`${origin}/api/stream-deck/toggle/${deviceId}`)
  }

  return <button onClick={copyToClipboard}>Copy to Clipboard</button>
}
