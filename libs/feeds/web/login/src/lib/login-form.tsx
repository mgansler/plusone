import React, { ChangeEvent, FormEventHandler, ReactNode, useState } from 'react'
import {
  Backdrop,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  createStyles,
  makeStyles,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import { useRegister } from './use-register'
import { useLogin } from './use-login'

const useClassNames = makeStyles((theme) =>
  createStyles({
    tabs: {
      marginBottom: theme.spacing(2),
    },
    tabPanel: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    container: {
      marginTop: theme.spacing(8),
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    cardActions: {
      justifyContent: 'center',
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
    },
  }),
)

enum ActiveTab {
  Login,
  Register,
}

interface TabPanelProps {
  index: ActiveTab
  value: ActiveTab
  children: ReactNode
}

function TabPanel({ index, value, children }: TabPanelProps) {
  const classNames = useClassNames()
  return (
    <div role={'tabpanel'} hidden={index !== value} className={classNames.tabPanel}>
      {index === value ? children : null}
    </div>
  )
}

function UsernameTextField() {
  return <TextField fullWidth={true} id={'username'} name={'username'} type={'text'} label={'Username'} />
}

interface PasswordTextFieldProps {
  activeTab: ActiveTab
}

function PasswordTextField({ activeTab }: PasswordTextFieldProps) {
  return (
    <TextField
      fullWidth={true}
      id={'password'}
      name={'password'}
      type={'password'}
      label={'Password'}
      autoComplete={activeTab === ActiveTab.Register ? 'new-password' : 'on'}
    />
  )
}

export interface FeedsWebLoginProps {
  setToken: (newToken: string) => void
}

export function LoginForm({ setToken }: FeedsWebLoginProps) {
  const classNames = useClassNames()

  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Login)
  const {
    mutate: onRegister,
    error: registerError,
    isLoading: isRegistering,
    data: newUserData,
    reset: resetRegister,
  } = useRegister()
  const { mutate: onLogin, error: loginError, isLoading: isLoggingIn, reset: resetLogin } = useLogin(setToken)

  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const username = (event.currentTarget.elements.namedItem('username') as HTMLInputElement).value
    const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value

    if (activeTab === ActiveTab.Login) {
      onLogin({ username, password })
    } else {
      onRegister({ username, password })
    }
  }

  const onTabChange = (_: ChangeEvent<unknown>, selectedTab: ActiveTab) => {
    resetLogin()
    resetRegister()
    setActiveTab(selectedTab)
  }

  return (
    <Container maxWidth={'sm'} className={classNames.container}>
      <Card>
        <form onSubmit={onSubmit}>
          <CardContent className={classNames.cardContent}>
            <Typography variant={'h4'}>Welcome to feeds-web-login!</Typography>
            <div>
              <Tabs value={activeTab} onChange={onTabChange} className={classNames.tabs}>
                <Tab label={'Login'} />
                <Tab label={'Register'} />
              </Tabs>

              <TabPanel value={ActiveTab.Login} index={activeTab}>
                <UsernameTextField />
                <PasswordTextField activeTab={activeTab} />
                {loginError && <Alert severity={'error'}>{(loginError as Error).message}</Alert>}
              </TabPanel>

              <TabPanel value={ActiveTab.Register} index={activeTab}>
                <UsernameTextField />
                <PasswordTextField activeTab={activeTab} />
                {newUserData && (
                  <Alert severity={'success'}>{`Successfully registered '${newUserData.username}'`}</Alert>
                )}
                {registerError && <Alert severity={'error'}>{(registerError as Error).message}</Alert>}
              </TabPanel>
            </div>
          </CardContent>

          <CardActions className={classNames.cardActions}>
            <Button type={'submit'} variant={'contained'}>
              {activeTab === ActiveTab.Login ? 'Login' : 'Register'}
            </Button>
          </CardActions>
        </form>
      </Card>
      <Backdrop open={isRegistering || isLoggingIn} className={classNames.backdrop}>
        <CircularProgress color={'inherit'} />
      </Backdrop>
    </Container>
  )
}
