import React, { useCallback, useRef } from 'react'
import { Button } from '@material-ui/core'
import { useFileDownload } from '@plusone/hooks'
import { ConferenceLink } from '@plusone/conference-links'

interface ImportExportProps {
  links: ConferenceLink[]
  load: (links: ConferenceLink[]) => void
}

export const ImportExport: React.FC<ImportExportProps> = ({ links, load }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    if (fileInputRef.current?.files) {
      const fileReader = new FileReader()
      const file = fileInputRef.current.files[0]
      fileReader.readAsText(file)
      fileReader.onload = () => {
        const items = JSON.parse(fileReader.result as string)
        load(items)
      }
    }
  }, [load])

  const handleExport = useFileDownload({
    content: links,
    filename: 'export.json',
  })

  return (
    <React.Fragment>
      <input
        type={'file'}
        accept={'application/json'}
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleImport}
      />
      <Button onClick={() => fileInputRef.current?.click()}>Import</Button>
      <Button onClick={handleExport}>Export</Button>
    </React.Fragment>
  )
}
