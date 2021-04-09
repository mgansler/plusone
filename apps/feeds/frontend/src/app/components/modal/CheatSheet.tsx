import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import {
  Keyboard,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@material-ui/icons'
import React from 'react'

import { Modal } from './index'

const useCheatSheetStyles = makeStyles((theme) =>
  createStyles({
    button: {
      margin: '0 auto',
    },
    dialogContent: {
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridRowGap: theme.spacing(1),
      gridColumnGap: theme.spacing(2),
    },
  }),
)

interface CheatSheetEntryProps {
  keyCombination: JSX.Element | string
  description: string
}

function CheatSheetEntry({
  keyCombination,
  description,
}: CheatSheetEntryProps) {
  const classNames = useCheatSheetStyles()
  return (
    <React.Fragment>
      <Button
        className={classNames.button}
        variant={'contained'}
        disableRipple={true}
      >
        {keyCombination}
      </Button>
      <DialogContentText>{description}</DialogContentText>
    </React.Fragment>
  )
}

export const CheatSheet: React.FC<Modal> = ({ isOpen, open, close }) => {
  const classNames = useCheatSheetStyles()
  return (
    <React.Fragment>
      <MenuItem color={'inherit'} onClick={open}>
        <ListItemIcon>
          <Keyboard />
        </ListItemIcon>
        <ListItemText primary={'Cheat Sheet'} />
      </MenuItem>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>Keyboard CheatSheet</DialogTitle>

        <DialogContent className={classNames.dialogContent}>
          <CheatSheetEntry
            keyCombination={<KeyboardArrowUp />}
            description={'Previous article'}
          />
          <CheatSheetEntry
            keyCombination={<KeyboardArrowDown />}
            description={'Next article'}
          />
          <CheatSheetEntry
            keyCombination={'Space'}
            description={'Toggle unread'}
          />
          <CheatSheetEntry
            keyCombination={'N'}
            description={'Mark article as read and next article'}
          />
          <CheatSheetEntry
            keyCombination={'O'}
            description={'Open article in new tab/window'}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
