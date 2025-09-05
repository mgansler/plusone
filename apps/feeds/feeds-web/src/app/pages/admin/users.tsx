import { useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import type { UserResponseDto } from '@plusone/feeds/api-client'
import { getGetUsersQueryKey, useDeleteUser, useValidatedGetUsers } from '@plusone/feeds/api-client'

type UserProps = {
  user: UserResponseDto
}

function User({ user }: Readonly<UserProps>) {
  const queryClient = useQueryClient()
  const { mutateAsync } = useDeleteUser({
    mutation: {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() })
      },
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
  const { data: users } = useValidatedGetUsers()

  return (
    <div>
      <Link to={'..'}>up</Link>
      {users?.map((user) => (
        <User key={user.id} user={user} />
      ))}
    </div>
  )
}
