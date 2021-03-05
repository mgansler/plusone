import React, { useCallback, useRef } from 'react'
import { Button } from '@material-ui/core'

import { ZoomLinkProps } from '../zoom-link/zoom-link'
import { fromJson } from '../app'

interface ImportExportProps {
  links: ZoomLinkProps[]
  load: (links: ZoomLinkProps[]) => void
}

export const ImportExport: React.FC<ImportExportProps> = ({ links, load }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = useCallback(() => {
    if (fileInputRef.current?.files) {
      const fileReader = new FileReader()
      const file = fileInputRef.current.files[0]
      fileReader.readAsText(file)
      fileReader.onload = () => {
        const items = fromJson(fileReader.result as string)
        load(items)
      }
    }
  }, [load])

  const handleExport = useCallback(() => {
    const fileContent = new Blob([JSON.stringify(links)], {
      type: 'application/json',
    })
    const anchorElement = document.createElement('a')
    anchorElement.setAttribute('href', URL.createObjectURL(fileContent))
    anchorElement.setAttribute('download', 'export.json')

    anchorElement.click()

    anchorElement.remove()
  }, [links])

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
