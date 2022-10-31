import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import type { UserResponseDto } from '@plusone/feeds/api-client'
import { getGetUsersQueryKey, useDeleteUser, useGetUsers } from '@plusone/feeds/api-client'

type UserProps = {
  user: UserResponseDto
}

function User({ user }: UserProps) {
  const queryClient = useQueryClient()
  const { mutateAsync } = useDeleteUser({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries(getGetUsersQueryKey()),
    },
  })

  const onDelete = async () => {
    await mutateAsync({ userId: user.id })
  }

  return (
    <div>
      {user.username}
      <button disabled={user.isAdmin} onClick={onDelete}>
        delete
      </button>
    </div>
  )
}

export function Users() {
  const { data: users } = useGetUsers()

  return (
    <div>
      <Link to={'..'}>up</Link>
      {users?.data.map((user) => (
        <User key={user.id} user={user} />
      ))}
    </div>
  )
}
