import { Route, Link } from 'react-router-dom'

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
            <Link to="/page-2">Page 2</Link>
          </li>
        </ul>
      </nav>
      <Route path="/" exact={true}>
        <div>Homepage</div>
      </Route>
      <Route path="/page-2" exact={true}>
        <div>Page 2</div>
      </Route>
    </>
  )
}
