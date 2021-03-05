import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Button,
  Card,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Add, VideoCall } from '@material-ui/icons'

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      '&:hover': {
        cursor: 'pointer',
      },
    },
  }),
)

export interface ZoomLinkProps {
  name: string
  url: URL
  confno?: string
  pwd?: string
}

export const fromUrl = (url: URL): [string, string | undefined] => {
  const [confnoFromUrl] = new RegExp(/\d+/).exec(url.pathname) ?? []
  const pwdFromUrl = url.searchParams.get('pwd')

  return [confnoFromUrl, pwdFromUrl ?? undefined]
}

const fromZoomLink = (link: string): Omit<ZoomLinkProps, 'name'> => {
  const url = new URL(link)
  const [confno, pwd] = fromUrl(url)

  return {
    url,
    confno,
    pwd,
  }
}

export const ZoomLink: React.FC<ZoomLinkProps> = ({
  name,
  url,
  confno,
  pwd,
}) => {
  const classNames = useStyles()

  const zoomLink = useMemo(() => {
    const [confnoFromUrl, pwdFromUrl] = fromUrl(url)

    if (!confnoFromUrl) {
      return null
    }

    return (
      `zoommtg://${url.hostname}/join?action=join&confno=${
        confno ?? confnoFromUrl
      }` + (pwd || pwdFromUrl ? `&pwd=${pwd ?? pwdFromUrl}` : '')
    )
  }, [confno, pwd, url])

  if (zoomLink === null) {
    // Invalid zoom link
    return null
  }

  return (
    <Card className={classNames.card} onClick={() => window.open(zoomLink)}>
      <VideoCall />
      <Typography>{name}</Typography>
    </Card>
  )
}

export const NewZoomLink: React.FC<{
  addNewLink: (link: ZoomLinkProps) => void
}> = ({ addNewLink }) => {
  const classNames = useStyles()

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const nameInputRef = useRef<HTMLInputElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)

  const handleOpenDialog = useCallback(() => setIsOpen(true), [])
  const handleCloseDialog = useCallback(() => setIsOpen(false), [])
  const handleNewZoomLink = useCallback(() => {
    if (nameInputRef.current && linkInputRef.current) {
      const newLink: ZoomLinkProps = {
        name: nameInputRef.current.value,
        ...fromZoomLink(linkInputRef.current.value),
      }
      addNewLink(newLink)
      setIsOpen(false)
    }
  }, [addNewLink])

  return (
    <React.Fragment>
      <Card className={classNames.card} onClick={handleOpenDialog}>
        <Add />
        <Typography>Add</Typography>
      </Card>
      <Dialog open={isOpen}>
        <DialogTitle>New Zoom Link</DialogTitle>
        <DialogContent dividers={true}>
          <TextField
            id={'name'}
            fullWidth={true}
            inputRef={nameInputRef}
            label={'Name'}
          />

          <TextField
            id={'zoomlink'}
            fullWidth={true}
            inputRef={linkInputRef}
            label={'Zoom Link'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleNewZoomLink}>Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
