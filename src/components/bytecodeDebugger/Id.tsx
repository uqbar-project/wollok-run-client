
import React, { useContext, memo } from 'react'
import $ from './Id.module.scss'
import { EvaluationContext, LayoutContext } from './BytecodeDebuggerContexts'
import { Id as IdType } from 'wollok-ts'
import { qualifiedId, shortId, CollapsibleName } from './Utils'

export type IdProps = { id?: IdType }

const Id = ({ id }: IdProps) => {
  const { evaluation } = useContext(EvaluationContext)
  const { setInstanceSearch } = useContext(LayoutContext)
  const instance = id && evaluation.instance(id)

  const onClick = () => {
    if(instance) setInstanceSearch(qualifiedId(instance))
  }

  return (
    <div className={$.container} onClick={onClick}>
      {instance ? <CollapsibleName name={qualifiedId(instance)}/> : shortId(id)}
    </div>
  )
}

export default memo(Id)