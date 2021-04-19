import { useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { AppBar, Container, createStyles, Paper, Toolbar, Typography } from '@material-ui/core'
import React from 'react'

import { ConferenceLink } from '@plusone/conference-links'
import { useLocalStorage } from '@plusone/hooks'

import {
  NewConferenceLink,
  ConferenceLinkButton,
} from './conference-link-button/conference-link-button'
import { ImportExport } from './import-export/import-export'
import { useMigrations } from './migrations/use-migrations'

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

export function App() {
  const classNames = useStyles()

  useMigrations()

  const [storedLinks = [], setStoredLinks] = useLocalStorage({
    key: 'zoomLinks',
    defaultValue: undefined,
  })

  const addNewLink = useCallback(
    (link: ConferenceLink) => {
      setStoredLinks([...storedLinks, link])
    },
    [setStoredLinks, storedLinks],
  )

  const loadLinks = useCallback(
    (links: ConferenceLink[]) => {
      console.log(links)
      setStoredLinks(links)
    },
    [setStoredLinks],
  )

  return (
    <React.Fragment>
      <AppBar position={'static'}>
        <Toolbar>
          <Typography variant={'h6'}>Quick Zoom</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'sm'}>
        <Paper className={classNames.grid}>
          {storedLinks.map((conference) => (
            <ConferenceLinkButton key={conference.url} {...conference} />
          ))}
          <NewConferenceLink addNewLink={addNewLink} />
        </Paper>
        <ImportExport links={storedLinks} load={loadLinks} />
      </Container>
    </React.Fragment>
  )
}
