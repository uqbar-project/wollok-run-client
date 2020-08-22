import React, { useContext } from 'react'
import SearchList from './SearchList'
import { shortId } from './Utils'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'
import Context from './Context'


const { keys } = Object


export type ContextSearchListProps = { }

const ContextSearchList = ({ }: ContextSearchListProps) => {
  const { evaluation } = useContext(BytecodeDebuggerContext)

  return (
    <SearchList
      title = 'Contexts'
      elements={evaluation.listContexts().map(id => evaluation.context(id))}
      searchTerms={context => [
        shortId(context.id),
        ...keys(context.locals).flatMap(name => [name, shortId(context.locals[name])]),
      ]}
    >
      { (context, search) => (
        <Context
          context={context}
          nameFilter={name => name.includes(search) || shortId(context.locals[name]).includes(search)}
          key={context.id}
        />
      )}
    </SearchList>
  )
}

export default ContextSearchList