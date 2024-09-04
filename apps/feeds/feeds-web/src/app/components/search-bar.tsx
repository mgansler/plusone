import { Cancel, Search } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useSearchParams } from 'react-router-dom'

type SearchForm = {
  search: string
}

export function SearchBar() {
  const location = useLocation()
  const { handleSubmit, register, reset } = useForm<SearchForm>()

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    reset({ search: searchParams.get('search') })
  }, [reset, searchParams])

  const onSubmit = (data: SearchForm) => {
    setSearchParams({ search: data.search })
  }

  if (location.pathname === '/member/new') {
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        id={'search-input'}
        InputProps={{
          startAdornment: (
            <InputAdornment position={'start'}>
              <Search />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position={'end'}>
              <IconButton onClick={() => setSearchParams({})} onMouseDown={(e) => e.preventDefault()} edge={'end'}>
                <Cancel />
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...register('search')}
        required={true}
      />
    </form>
  )
}
