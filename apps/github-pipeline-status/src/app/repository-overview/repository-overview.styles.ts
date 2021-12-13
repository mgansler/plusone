import { Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'

export const useClassNames = makeStyles<Theme>((theme) =>
  createStyles({
    expanded: {},
    accordionRoot: {
      '&:before': {
        display: 'none',
      },
      '&$expanded': {
        margin: 'auto',
      },
    },
    accordionSummaryRoot: {
      minHeight: theme.spacing(6),
      '&$expanded': {
        minHeight: theme.spacing(6),
      },
    },
    accordionSummarySkeleton: {
      gap: theme.spacing(3),
    },
    accordionSummaryContent: {
      alignItems: 'center',
      margin: 0,
      '&$expanded': {
        margin: 0,
      },
    },
    accordionDetails: {
      display: 'flex',
      flexDirection: 'column',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      maxHeight: theme.spacing(4.5),
    },
    linkColumn: {
      flexBasis: '5%',
    },
    pullRequestLink: {
      marginLeft: theme.spacing(1),
    },
    titleColumn: {
      flexBasis: '50%',
    },
    workflowColumn: {
      flexBasis: '20%',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    pullRequestsOrReviewsColumn: {
      flexBasis: '25%',
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    draftTooltip: {
      color: theme.palette.warning.contrastText,
      backgroundColor: theme.palette.warning.light,
    },
    draftTooltipArrow: {
      color: theme.palette.warning.light,
    },
  }),
)
