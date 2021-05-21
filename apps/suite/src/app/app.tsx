import { Suspense } from 'react'
import { Route, Link } from 'react-router-dom'
import { lazy } from 'react'

const DinnerPlan = lazy(() => import('@plusone/dinner-plan'))

export function App() {
  return (
    <>
      <h1>Welcome to suite!</h1>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/dinner-plan">Dinner Plan</Link>
          </li>
        </ul>
      </nav>
      <Route path="/" exact={true}>
        <div>Homepage</div>
      </Route>
      <Route path="/dinner-plan" exact={true}>
        <Suspense fallback={<div>Loading...</div>}>
          <DinnerPlan />
        </Suspense>
      </Route>
    </>
  )
}
