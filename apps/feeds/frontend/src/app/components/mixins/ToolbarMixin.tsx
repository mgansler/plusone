import { createStyles, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
  }),
)

export function ToolbarMixin() {
  const classNames = useStyles()
  return <div className={classNames.toolbar} />
}
