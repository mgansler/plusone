import { useCallback } from 'react'

import { downloadFile } from '@plusone/dom-utils'

interface UseFileDownloadProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
  filename: string
}

export const useFileDownload = ({ content, filename }: UseFileDownloadProps) =>
  useCallback(() => downloadFile(content, filename), [content, filename])
