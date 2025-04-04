import { Card, CardContent, Container, useTheme } from '@mui/material'
import type { ReactNode } from 'react'
import React from 'react'

type LoginCardProps = {
  children: ReactNode
}

export function LoginCard({ children }: LoginCardProps) {
  const theme = useTheme()

  return (
    <Container maxWidth={'sm'} sx={{ mt: theme.spacing(8) }}>
      <Card>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing(2) }}>
          {children}
        </CardContent>
      </Card>
    </Container>
  )
}
