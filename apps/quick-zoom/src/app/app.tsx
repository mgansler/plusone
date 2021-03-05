import React, { useCallback, useEffect, useReducer } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Container,
  createStyles,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core'

import {
  fromUrl,
  NewZoomLink,
  ZoomLink,
  ZoomLinkProps,
} from './zoom-link/zoom-link'
import { ImportExport } from './import-export/import-export'

const useStyles = makeStyles((theme) =>
  createStyles({
    grid: {
      display: 'grid',
      padding: theme.spacing(1),
      gridGap: theme.spacing(1),
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridAutoRows: '1fr',
      '&:before': {
        content: "''",
        width: 0,
        paddingBottom: '100%',
        gridRow: '1/1',
        gridColumn: '1/1',
      },
      '&>*:first-child': {
        gridRow: '1/1',
        gridColumn: '1/1',
      },
    },
  }),
)

type ZoomLinkState = ZoomLinkProps[]

type ZoomLinkAction =
  | {
      type: 'add'
      payload: ZoomLinkProps
    }
  | {
      type: 'load'
      payload: ZoomLinkProps[]
    }

const reducer = (
  state: ZoomLinkState,
  { type, payload }: ZoomLinkAction,
): ZoomLinkState => {
  switch (type) {
    case 'add': {
      return [...state, payload as ZoomLinkProps]
    }
    case 'load': {
      return payload as ZoomLinkProps[]
    }
  }
  return state
}

export const fromJson = (json: string): ZoomLinkProps[] => {
  const items = JSON.parse(json)

  if (!Array.isArray(items)) {
    return []
  }

  return items.map(
    ({
      name,
      url: link,
      confno,
      pwd,
    }: Omit<ZoomLinkProps, 'url'> & { url: string }) => {
      const url = new URL(link)

      if (confno !== undefined) {
        return { name, url, confno, pwd }
      }

      const [confnoFromUrl, pwdFromUrl] = fromUrl(url)
      return { name, url, confno: confnoFromUrl, pwd: pwdFromUrl }
    },
  )
}

const loadFromStorage = (): ZoomLinkProps[] => {
  return fromJson(localStorage.getItem('zoomLinks') ?? '[]')
}

export const App: React.FC = () => {
  const classNames = useStyles()

  const [state, dispatch] = useReducer(reducer, [], loadFromStorage)

  const addNewLink = useCallback((link: ZoomLinkProps) => {
    dispatch({ type: 'add', payload: link })
  }, [])

  const loadLinks = useCallback((links: ZoomLinkProps[]) => {
    dispatch({ type: 'load', payload: links })
  }, [])

  useEffect(() => {
    localStorage.setItem('zoomLinks', JSON.stringify(state))
  }, [state])

  return (
    <React.Fragment>
      <AppBar position={'static'}>
        <Toolbar>
          <Typography variant={'h6'}>Quick Zoom</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'}>
        <Paper className={classNames.grid}>
          {state.map((link) => (
            <ZoomLink key={link.url.href} {...link} />
          ))}
          <NewZoomLink addNewLink={addNewLink} />
        </Paper>
        <ImportExport links={state} load={loadLinks} />
      </Container>
    </React.Fragment>
  )
}
