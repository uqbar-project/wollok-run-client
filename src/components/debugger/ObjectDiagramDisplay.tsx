import React, { useContext } from 'react'
import ObjectDiagram from '../worksheet/ObjectDiagram'
import { DebuggerContext } from './Debugger'

const ObjectDiagramDisplay = () => {

  const { executionDirector } = useContext(DebuggerContext)

  return (
    <ObjectDiagram evaluation={executionDirector.evaluation}/>
  )
}

export default ObjectDiagramDisplay