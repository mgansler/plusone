import { useUserContext } from '../context/user'

export function UserInfo() {
  const { userInfo, logout } = useUserContext()

  if (userInfo === undefined) {
    return null
  }

  return (
    <div>
      <span>{userInfo.username}</span>
      <button onClick={logout}>logout</button>
    </div>
  )
}
