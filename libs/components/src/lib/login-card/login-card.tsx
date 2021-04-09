import { Card, CardContent, Container, createStyles } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import React, { ReactNode } from 'react'

const useClassNames = makeStyles((theme) =>
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
