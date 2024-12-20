import type { Theme } from '@mui/material'
import { FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Toolbar } from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
import type { MutableRefObject, RefObject } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { RepositoryOverview } from '../repository-overview/repository-overview'

import { useFetchOrganizations } from './organizations-bootstrap'

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    toolbar: {
      gap: theme.spacing(1),
    },
    formControl: {
      minWidth: 200,
    },
  }),
)

export function Organizations() {
  const classNames = useStyles()

  const navigate = useNavigate()
  const { organizationName } = useParams()

  const { data, isLoading } = useFetchOrganizations()

  const toolbar = useRef<HTMLDivElement | null>(null)

  if (isLoading || data === undefined) {
    return <LinearProgress />
  }
  if (organizationName === undefined) {
    return null
  }

  return (
    <Paper>
      <Toolbar className={classNames.toolbar} ref={toolbar as RefObject<HTMLDivElement>}>
        <FormControl className={classNames.formControl}>
          <InputLabel id={'select-org-label'}>Select Organization</InputLabel>
          <Select
            labelId={'select-org-label'}
            value={organizationName}
            onChange={(event) => navigate(`/organization/${event.target.value}`)}
          >
            {organizationName === '' && <MenuItem value={''} />}
            {data.viewer.organizations.nodes?.map((organization) =>
              organization === null ? null : (
                <MenuItem key={organization.id} value={organization.login}>
                  {organization.name}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>
      </Toolbar>

      <RepositoryOverview toolbarRef={toolbar as MutableRefObject<HTMLDivElement>} />
    </Paper>
  )
}
