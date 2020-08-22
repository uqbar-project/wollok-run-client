import React from 'react'
import { Context as ContextType } from 'wollok-ts/dist/interpreter'
import { shortId, Id } from './Utils'
import { Name } from 'wollok-ts'
import $ from './Context.module.scss'

const { keys } = Object

export type ContextProps = {
  context: ContextType
  nameFilter?: (name: Name) => boolean
}

const Context = ({ context, nameFilter = () => true }: ContextProps) => {
  return (
    <div>
      <h3>{shortId(context.id)}</h3>
      <div className={$.locals}>
        {
          keys(context.locals).filter(nameFilter).map(name => {
            return (
              <div key={name}>
                <div>{name}:</div>
                <Id id={context.locals[name]}/>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default Context