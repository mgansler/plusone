import { FormControl, InputLabel, LinearProgress, MenuItem, Paper, Select, Toolbar, useTheme } from '@mui/material'
import type { MutableRefObject, ReactNode, RefObject } from 'react'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { RepositoryOverview } from '../repository-overview/repository-overview'

import { useFetchOrganizations } from './organizations-bootstrap'

export function Organizations() {
  const theme = useTheme()

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
      <Toolbar
        sx={{
          gap: theme.spacing(1),
        }}
        ref={toolbar as RefObject<HTMLDivElement>}
      >
        <FormControl
          sx={{
            minWidth: 200,
          }}
        >
          <InputLabel id={'select-org-label'}>Select Organization</InputLabel>
          <Select
            labelId={'select-org-label'}
            value={organizationName}
            onChange={(event) => navigate(`/organization/${event.target.value}`)}
            variant={'outlined'}
          >
            {organizationName === '' ? ((<MenuItem value={''} />) as ReactNode) : null}
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
