import { createStyles, makeStyles } from '@material-ui/core'

export const useFeedStyles = makeStyles((theme) =>
  createStyles({
    loading: {
      margin: 'auto',
    },
    articleList: {
      width: '100%',
      padding: theme.spacing(1),
      overflow: 'scroll',
    },
    articleCard: {
      width: '100%',
      marginBottom: theme.spacing(1),
      overflow: 'initial',
    },
  }),
)
