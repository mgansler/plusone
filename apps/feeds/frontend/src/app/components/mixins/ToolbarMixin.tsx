import { createStyles, makeStyles } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
  }),
)

export const ToolbarMixin: React.FC = () => {
  const classNames = useStyles()
  return <div className={classNames.toolbar} />
}
