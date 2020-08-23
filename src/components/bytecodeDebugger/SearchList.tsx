import React, { ReactNode, Dispatch } from 'react'
import { FiSearch as SearchIcon } from 'react-icons/fi'
import $ from './SearchList.module.scss'
import { List } from 'wollok-ts'

export type SearchListProps<T> = {
  title: string
  elements: List<T>
  searchTerms: (elem: T) => List<string>
  children: (elem: T, search: string) => ReactNode
  search: string
  setSearch: Dispatch<string>
}

const SearchList = <T extends unknown>({ title, elements, searchTerms, children, search, setSearch }: SearchListProps<T>) => {
  const content = elements
    .filter(element => searchTerms(element).some(term => term.includes(search)))
    .map(element => children(element, search))

  return (
    <div className={$.container}>
      <h2>
        {title}({content.length}/{elements.length})
        <div><SearchIcon/><input value={search} onChange={({ target }) => setSearch(target.value)}/></div>
      </h2>
      <div>{content}</div>
    </div>
  )
}

export default SearchList

SearchList.whyDidYouRender = true