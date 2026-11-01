import { SearchIcon } from './icons'

type SearchFieldProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

export function SearchField({ value, onChange, placeholder, label }: SearchFieldProps) {
  return (
    <div className="search">
      <SearchIcon className="search-icon" />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
