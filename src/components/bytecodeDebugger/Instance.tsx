import React, { useContext } from 'react'
import { RuntimeObject } from 'wollok-ts/dist/interpreter'
import { qualifiedId, contextHierarchy } from './Utils'
import Context from './Context'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'
import $ from './Instance.module.scss'


type InstanceProps = {
  instance: RuntimeObject
}

const Instance = ({ instance }: InstanceProps) => {
  const { evaluation } = useContext(BytecodeDebuggerContext)
  
  return (
    <div className={$.container}>
      <h3>{qualifiedId(instance)}</h3>
      <div>
        { contextHierarchy(evaluation, instance.id).map(context =>
          <Context key={context.id} context={context}/>
        )}
      </div>
    </div>
  )
}

export default Instance