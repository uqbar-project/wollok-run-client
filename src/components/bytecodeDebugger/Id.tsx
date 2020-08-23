
import React, { useContext, memo } from 'react'
import $ from './Id.module.scss'
import { EvaluationContext, LayoutContext } from './BytecodeDebuggerContexts'
import { Id as IdType } from 'wollok-ts'
import { qualifiedId, shortId } from './Utils'

export type IdProps = { id: IdType }

const Id = ({ id }: IdProps) => {
  const { evaluation } = useContext(EvaluationContext)
  const { setContextSearch, setInstanceSearch } = useContext(LayoutContext)
  const instance = evaluation.maybeInstance(id)

  const onClick = () => {
    if(instance) setInstanceSearch(qualifiedId(instance))
    else setContextSearch(shortId(id))
  }

  return (
    <div className={$.container} onClick={onClick}>
      {instance ? qualifiedId(instance) : shortId(id)}
    </div>
  )
}

export default memo(Id)