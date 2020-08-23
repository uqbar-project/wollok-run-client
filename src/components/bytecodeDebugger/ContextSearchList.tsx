import React, { useContext, memo } from 'react'
import SearchList from './SearchList'
import { shortId } from './Utils'
import { EvaluationContext, LayoutContext } from './BytecodeDebuggerContexts'
import Context from './Context'


const { keys } = Object


export type ContextSearchListProps = { }

const ContextSearchList = ({ }: ContextSearchListProps) => {
  const { evaluation } = useContext(EvaluationContext)
  const { contextSearch, setContextSearch } = useContext(LayoutContext)

  return (
    <SearchList
      title = 'Contexts'
      elements={evaluation.listContexts().map(id => evaluation.context(id))}
      search={contextSearch}
      setSearch={setContextSearch}
      searchTerms={context => [
        shortId(context.id),
        ...keys(context.locals).flatMap(name => [name, shortId(context.locals[name])]),
      ]}
    >
      { (context, search) => (
        <Context
          context={context}
          nameFilter={name => shortId(context.id).includes(search) || name.includes(search) || shortId(context.locals[name]).includes(search)}
          key={context.id}
        />
      )}
    </SearchList>
  )
}

export default memo(ContextSearchList)