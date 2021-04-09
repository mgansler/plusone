import { AppBar, Toolbar, Typography } from '@material-ui/core'

import { useHeaderStyles } from './styles'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const classNames = useHeaderStyles()

  return (
    <AppBar position={'fixed'} className={classNames.appBar}>
      <Toolbar>
        <Typography variant={'h6'} noWrap={true}>
          Feeds
        </Typography>
        <div className={classNames.toolbarSpacer} />
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
