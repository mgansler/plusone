import { useMatch } from 'react-router-dom'
import { Outlet } from 'remix'

export default function () {
  const match = useMatch('days/:day')

  return (
    <main>
      <h2>Day {Number(match?.params.day)}</h2>
      <Outlet />
    </main>
  )
}
