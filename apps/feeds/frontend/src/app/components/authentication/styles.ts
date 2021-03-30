import { createStyles, makeStyles } from '@material-ui/core'

export const useAuthenticationStyles = makeStyles((theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3, 2),
      margin: 'auto',
    },
    loading: {
      margin: 'auto',
    },
  }),
)
