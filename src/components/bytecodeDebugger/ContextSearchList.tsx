import React from 'react'
import SearchList from './SearchList'
import { Evaluation } from 'wollok-ts'
import { shortId, qualifiedId } from './Utils'
import $ from './ContextSearchList.module.scss'


const { keys } = Object


export type ContextSearchListProps = {
  evaluation: Evaluation
}

const ContextSearchList = ({ evaluation }: ContextSearchListProps) => {
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