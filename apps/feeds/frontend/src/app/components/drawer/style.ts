import { createStyles, makeStyles } from '@material-ui/core'
import { red } from '@material-ui/core/colors'

export const useFeedStyles = makeStyles((theme) =>
  createStyles({
    drawer: {
      width: theme.appDrawer.width,
      flexShrink: 0,
    },
    drawerPaper: {
      width: theme.appDrawer.width,
    },
    drawerItem: {
      paddingRight: 0,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    drawerBadge: {
      maxWidth: theme.appDrawer.width - theme.spacing(14),
    },
    drawerBadgeNested: {
      maxWidth: theme.appDrawer.width - theme.spacing(14 + 4),
    },
    drawerDelete: {
      marginLeft: 'auto',
    },
    feedList: {
      flexGrow: 1,
      overflow: 'scroll',
    },
    avatar: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      minWidth: 0,
      marginRight: theme.spacing(1),
    },
    feedWithError: {
      width: theme.spacing(3),
      height: theme.spacing(3),
      minWidth: 0,
      marginRight: theme.spacing(1),
      color: red['A700'],
    },
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  }),
)
