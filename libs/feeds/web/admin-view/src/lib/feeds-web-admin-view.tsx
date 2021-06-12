import { useFetchUsers } from './use-fetch-users'

export function FeedsWebAdminView() {
  const { data: users = [] } = useFetchUsers()

  return (
    <div>
      <h1>Welcome to feeds-web-admin-view!</h1>
      <div>User Count: {users.length}</div>
      {users.map((user) => (
        <div key={user.id}>
          {user.username} - {user.isAdmin ? 'admin' : 'normal user'}
        </div>
      ))}
    </div>
  )
}
