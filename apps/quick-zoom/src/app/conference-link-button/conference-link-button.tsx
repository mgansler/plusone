import { useCallback, useRef, useState } from 'react'
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
import React from 'react'

import { ConferenceLink, fromLink } from '@plusone/conference-links'

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

export function ConferenceLinkButton({ title, url }: ConferenceLink) {
  const classNames = useStyles()

  return (
    <Card className={classNames.card} onClick={() => window.open(url)}>
      <VideoCall />
      <Typography>{title}</Typography>
    </Card>
  )
}

type NewConferenceLinkProps = {
  addNewLink: (conference: ConferenceLink) => void
}

export function NewConferenceLink({ addNewLink }: NewConferenceLinkProps) {
  const classNames = useStyles()

  const [isOpen, setIsOpen] = useState<boolean>(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)

  const handleOpenDialog = useCallback(() => setIsOpen(true), [])
  const handleCloseDialog = useCallback(() => setIsOpen(false), [])
  const handleNewZoomLink = useCallback(() => {
    if (titleInputRef.current && linkInputRef.current) {
      const newLink: ConferenceLink = fromLink(
        linkInputRef.current.value,
        titleInputRef.current.value,
      )
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
            id={'title'}
            fullWidth={true}
            inputRef={titleInputRef}
            label={'Title'}
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
