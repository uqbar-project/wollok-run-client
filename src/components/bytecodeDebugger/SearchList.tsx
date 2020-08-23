import React, { ReactNode, Dispatch } from 'react'
import $ from './SearchList.module.scss'
import { List } from 'wollok-ts'
import Section from './Section'
import SearchBar from './SearchBar'

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
    <Section
      title={`${title}(${content.length}/${elements.length})`}
      titleDecoration={<SearchBar search={search} setSearch={setSearch}/>}
      containerClassName={$.content}
    >
      {content}
    </Section>
  )
}

export default SearchList

SearchList.whyDidYouRender = true