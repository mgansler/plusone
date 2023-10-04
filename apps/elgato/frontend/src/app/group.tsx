import { useParams } from 'react-router-dom'

export function Group() {
  const { groupId } = useParams()
  return <div>Group: {groupId}</div>
}
