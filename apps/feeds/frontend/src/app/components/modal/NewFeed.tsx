import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
  TextField,
} from '@material-ui/core'
import { Add } from '@material-ui/icons'
import React, { useState } from 'react'
import { useMutation } from 'react-apollo'

import { AddFeed, AddFeedMutation, AddFeedMutationVariables, FeedInput, FeedsAndGroups } from '@plusone/feeds-schema'

import { useDisableKeyboardControl } from '../../context'

import { Modal } from './index'

export const NewFeed: React.FC<Modal> = ({ isOpen, open, close }) => {
  const [feedInput, setFeedInput] = useState<FeedInput>({ uri: '' })
  const [createNewFeed] = useMutation<AddFeedMutation, AddFeedMutationVariables>(AddFeed, {
    refetchQueries: [{ query: FeedsAndGroups }],
  })

  const handleConfirm = () => {
    createNewFeed({ variables: { feed: feedInput } }).then(() => {
      close()
      setFeedInput({ uri: '' })
    })
  }

  useDisableKeyboardControl()

  return (
    <React.Fragment>
      <MenuItem color={'inherit'} onClick={open}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={'Add new Feed'} />
      </MenuItem>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>New Feed</DialogTitle>

        <DialogContent>
          <TextField
            label={'Feed Title'}
            fullWidth={true}
            type={'text'}
            id={'new-feed-title'}
            value={feedInput.title}
            onChange={({ currentTarget: { value } }) => setFeedInput((prevState) => ({ ...prevState, title: value }))}
          />
          <TextField
            label={'Feed URI'}
            fullWidth={true}
            type={'text'}
            id={'new-feed-uri'}
            required={true}
            value={feedInput.uri}
            onChange={({ currentTarget: { value } }) => setFeedInput((prevState) => ({ ...prevState, uri: value }))}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleConfirm}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
