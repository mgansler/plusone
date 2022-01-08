import { useEffect, useState } from 'react'

export default function Health() {
  const [health, setHealth] = useState()

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((value) => {
        setHealth(value.status)
      })
  }, [])

  return <p>{health}</p>
}
