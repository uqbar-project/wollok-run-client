import React, { Dispatch, memo } from 'react'
import { FiSearch as SearchIcon } from 'react-icons/fi'
import $ from './SearchBar.module.scss'

export type SearchBarProps = {
  search: string
  setSearch: Dispatch<string>
}

const SearchBar = ({ search, setSearch }: SearchBarProps) => {
  return (
    <div className={$.container}>
      <SearchIcon/>
      <input value={search} onChange={({ target }) => setSearch(target.value)}/>
    </div>
  )
}

export default memo(SearchBar)