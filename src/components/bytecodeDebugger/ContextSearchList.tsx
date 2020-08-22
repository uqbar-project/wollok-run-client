import React, { useContext } from 'react'
import SearchList from './SearchList'
import { shortId, qualifiedId } from './Utils'
import $ from './ContextSearchList.module.scss'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'


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
        <div className={$.context}>
          <h3>{shortId(context.id)}</h3>
          <div>
            {
              keys(context.locals)
                .filter(name => name.includes(search) || shortId(context.locals[name]).includes(search))
                .map(name => {
                  const instance = evaluation.maybeInstance(context.locals[name])
                  return (
                    <div key={name}>
                      <div>{name}:</div>
                      <div>{instance ? qualifiedId(instance) : shortId(context.locals[name])}</div>
                    </div>
                  )
                })
            }
          </div>
        </div>
      )}
    </SearchList>
  )
}

export default ContextSearchList