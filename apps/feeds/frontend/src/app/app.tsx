import { createStyles, CssBaseline, makeStyles, ThemeProvider } from '@material-ui/core'
import { ApolloProvider } from 'react-apollo'

import { AuthenticationProvider } from './components/authentication'
import { FeedDrawerList } from './components/drawer'
import { ArticleCardList } from './components/feed'
import { Header } from './components/header'
import { ToolbarMixin } from './components/mixins'
import { KeyboardControlProvider, SelectedArticleProvider, SelectedFeedsProvider } from './context'
import { apolloClient } from './graphql'
import { theme } from './theme'

const useAppStyles = makeStyles((theme) =>
  createStyles({
    content: {
      display: 'flex',
      minWidth: 0,
      minHeight: 0,
      flexGrow: 1,
    },
    contentContainer: {
      flexGrow: 1,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },

    root: {
      display: 'flex',
      width: '100vw',
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
  }),
)

export function App() {
  const classNames = useAppStyles()

  return (
    <div className={classNames.root}>
      <Header />

      <FeedDrawerList />

      <main className={classNames.contentContainer}>
        <ToolbarMixin />
        <div className={classNames.content}>
          <SelectedArticleProvider>
            <ArticleCardList />
          </SelectedArticleProvider>
        </div>
      </main>
    </div>
  )
}

export function AppWithProviders() {
  return (
    <ApolloProvider client={apolloClient}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <KeyboardControlProvider>
          <AuthenticationProvider>
            <SelectedFeedsProvider>
              <App />
            </SelectedFeedsProvider>
          </AuthenticationProvider>
        </KeyboardControlProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}
