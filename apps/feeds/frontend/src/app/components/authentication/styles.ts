import { createStyles, makeStyles } from '@material-ui/core'

export const useAuthenticationStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    container: {
      martinTop: theme.spacing(8),
    },
    loading: {
      margin: 'auto',
    },
  }),
)
