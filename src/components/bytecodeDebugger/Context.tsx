import React, { memo } from 'react'
import { shortId, CollapsibleName } from './Utils'
import { Context as ContextType, Name } from 'wollok-ts'
import $ from './Context.module.scss'
import Id from './Id'
import classNames from 'classnames'

export type ContextProps = {
  context: ContextType
  nameFilter?: (name: Name) => boolean
  highlighted?: boolean
}

const Context = ({ context, nameFilter = () => true, highlighted }: ContextProps) => {
  const localNames = [...context.locals.keys()].filter(nameFilter)
  return (
    <div>
      <h3 className={classNames({ [$.highlighted]: highlighted })}>{shortId(context.id)}</h3>
      <div className={$.locals}>
        {
          localNames.length
            ? localNames.map(name => {
              return (
                <div key={name}>
                  <div><CollapsibleName name={name}/>:</div>
                  <Id id={context.get(name)?.id}/>
                </div>
              )
            })
            : <i>---</i>
        }
      </div>
    </div>
  )
}

export default memo(Context)