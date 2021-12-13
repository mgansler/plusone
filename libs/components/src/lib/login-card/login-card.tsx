import { Card, CardContent, Container, Theme } from '@mui/material'
import createStyles from '@mui/styles/createStyles'
import makeStyles from '@mui/styles/makeStyles'
import React, { ReactNode } from 'react'

const useClassNames = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      marginTop: theme.spacing(8),
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
  }),
)

type LoginCardProps = {
  children: ReactNode
}

export function LoginCard({ children }: LoginCardProps) {
  const classNames = useClassNames()

  return (
    <Container maxWidth={'sm'} className={classNames.container}>
      <Card>
        <CardContent className={classNames.cardContent}>{children}</CardContent>
      </Card>
    </Container>
  )
}
