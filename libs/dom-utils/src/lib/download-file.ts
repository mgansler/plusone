// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const downloadFile = (content: any, filename: string) => {
  const fileContent = new Blob([JSON.stringify(content)], {
    type: 'application/json',
  })

  const anchorElement = document.createElement('a')
  anchorElement.setAttribute('href', URL.createObjectURL(fileContent))
  anchorElement.setAttribute('download', filename)

  anchorElement.click()

  anchorElement.remove()
}
