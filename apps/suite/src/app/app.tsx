import { lazy, Suspense } from 'react'
import { Link, Route } from 'react-router-dom'

const DinnerPlan = lazy(() => import('@plusone/dinner-plan'))

export function App() {
  return (
    <>
      <h1>Welcome to suite!</h1>
      <nav>
        <ul>
          <li>
            <Link to={'/'}>Home</Link>
          </li>
          <li>
            <Link to={'/dinner-plan'}>Dinner Plan</Link>
          </li>
        </ul>
      </nav>
      <main>
        <Route path={'/'} exact={true}>
          <div>Homepage</div>
        </Route>
        <Route path={'/dinner-plan'}>
          <Suspense fallback={<div>Loading...</div>}>
            <DinnerPlan />
          </Suspense>
        </Route>
      </main>
    </>
  )
}
