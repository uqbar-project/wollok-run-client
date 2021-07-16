import React, { useContext } from 'react'
import ObjectDiagram from '../worksheet/ObjectDiagram'
import { DebuggerContext } from './Debugger'

const ObjectDiagramDisplay = () => {

  const { interpreter } = useContext(DebuggerContext)

  return (
    <ObjectDiagram evaluation={interpreter.evaluation}/>
  )
}

export default ObjectDiagramDisplay