import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

type SearchForm = {
  search: string
}

export function SearchBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { handleSubmit, register, reset } = useForm<SearchForm>()

  const [searchParams] = useSearchParams()

  useEffect(() => {
    reset({ search: searchParams.get('search') })
  }, [reset, searchParams])

  const onSubmit = (data: SearchForm) => {
    navigate(`search?search=${data.search}`)
  }

  if (location.pathname === '/member/new') {
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        Search
        <input type={'text'} aria-label={'search'} {...register('search')} required={true} />
      </label>
      <button>Search</button>
    </form>
  )
}
