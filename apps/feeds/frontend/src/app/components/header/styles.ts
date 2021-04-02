import { createStyles, makeStyles } from '@material-ui/core'

export const useHeaderStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
    toolbarSpacer: {
      flexGrow: 1,
    },
  }),
)
