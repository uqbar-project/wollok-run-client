import React, { useContext, memo } from 'react'
import { qualifiedId, contextHierarchy } from './Utils'
import Context from './Context'
import { EvaluationContext } from './BytecodeDebuggerContexts'
import $ from './Instance.module.scss'
import { RuntimeObject } from 'wollok-ts'


type InstanceProps = {
  instance: RuntimeObject
}

const Instance = ({ instance }: InstanceProps) => {
  const { evaluation } = useContext(EvaluationContext)

  return (
    <div className={$.container}>
      <h3>{qualifiedId(instance)}{instance.innerValue !== undefined ? `[${instance.innerValue}]` : ''}</h3>
      <div>
        { contextHierarchy(evaluation, instance).map(context =>
          <Context key={context.id} context={context}/>
        )}
      </div>
    </div>
  )
}

export default memo(Instance)