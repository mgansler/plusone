import { Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@material-ui/core'
import { Lock, MoreVert } from '@material-ui/icons'
import React, { useCallback, useContext, useState } from 'react'

import { AuthenticationContext } from '../authentication'
import { CheatSheet, ModalIdentifier, NewFeed, NewGroup } from '../modal'

export function UserMenu() {
  const { logout } = useContext(AuthenticationContext)

  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>()
  const isUserMenuOpen = Boolean(userMenuAnchor)
  const [openModal, setOpenModal] = useState<ModalIdentifier>(ModalIdentifier.None)

  const handleLogout = useCallback(() => {
    setUserMenuAnchor(null)
    logout()
  }, [logout])

  const handleClose = useCallback(() => {
    setOpenModal(ModalIdentifier.None)
    setUserMenuAnchor(null)
  }, [])

  return (
    <React.Fragment>
      <IconButton
        aria-owns={isUserMenuOpen ? 'user-menu' : undefined}
        onClick={(event) => setUserMenuAnchor(event.currentTarget)}
      >
        <MoreVert />
      </IconButton>

      <Menu id={'user-menu'} anchorEl={userMenuAnchor} open={isUserMenuOpen} onClose={() => setUserMenuAnchor(null)}>
        <NewGroup
          isOpen={openModal === ModalIdentifier.NewGroup}
          open={() => setOpenModal(ModalIdentifier.NewGroup)}
          close={handleClose}
        />
        <NewFeed
          isOpen={openModal === ModalIdentifier.NewFeed}
          open={() => setOpenModal(ModalIdentifier.NewFeed)}
          close={handleClose}
        />
        <CheatSheet
          isOpen={openModal === ModalIdentifier.CheatCheat}
          open={() => setOpenModal(ModalIdentifier.CheatCheat)}
          close={handleClose}
        />

        <Divider />

        <MenuItem color={'inherit'} onClick={handleLogout}>
          <ListItemIcon>
            <Lock />
          </ListItemIcon>
          <ListItemText primary={'Logout'} />
        </MenuItem>
      </Menu>
    </React.Fragment>
  )
}
