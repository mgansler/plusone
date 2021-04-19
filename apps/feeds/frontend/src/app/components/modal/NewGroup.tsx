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
import React, { forwardRef, useState } from 'react'
import { useMutation } from 'react-apollo'

import {
  AddGroup,
  AddGroupMutation,
  AddGroupMutationVariables,
  FeedsAndGroups,
  GroupInput,
} from '@plusone/feeds-schema'

import { Modal } from './index'

export const NewGroup = forwardRef<unknown, Modal>(({ isOpen, open, close }, ref) => {
  const [groupInput, setGroupInput] = useState<GroupInput>({ name: '' })

  const [createNewGroup] = useMutation<AddGroupMutation, AddGroupMutationVariables>(AddGroup)

  const handleConfirm = () => {
    createNewGroup({
      variables: { group: groupInput },
      refetchQueries: [{ query: FeedsAndGroups }],
    }).then(() => {
      close()
      setGroupInput({ name: '' })
    })
  }

  return (
    <React.Fragment>
      <MenuItem color={'inherit'} onClick={open}>
        <ListItemIcon>
          <Add />
        </ListItemIcon>
        <ListItemText primary={'Add new Group'} />
      </MenuItem>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>New Group</DialogTitle>

        <DialogContent>
          <TextField
            label={'Group Name'}
            fullWidth={true}
            type={'text'}
            id={'new-group-name'}
            value={groupInput.name}
            onChange={({ currentTarget: { value } }) => setGroupInput((prevState) => ({ ...prevState, name: value }))}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleConfirm}>Create</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
})
