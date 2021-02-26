import { createUseStyles } from 'react-jss'

export const useLabelStyles = createUseStyles({
  label: {
    '& >*': {
      marginLeft: 4,
    },
  },
})
