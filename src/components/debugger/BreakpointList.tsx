import React, { useContext } from 'react'
import { DebuggerContext } from './Debugger'
import { nodeLabel } from './utils'
import $ from './BreakpointList.module.scss'
import { VscTrash as DeleteIcon } from 'react-icons/vsc'
import { Node } from 'wollok-ts'

const BreakpointList = () => {
  const { executionDirector, stateChanged } = useContext(DebuggerContext)
  const onDeleteBreakpoint = (node: Node) => () => {
    executionDirector.removeBreakpoint(node)
    stateChanged()
  }

  return (
    <div className={$.BreakpointList}>
      {executionDirector.breakpoints.map(node =>
        <div key={node.id} className={$.breakpoint}>
          {nodeLabel(node)} @ {node.sourceFileName()}({node.sourceMap?.start.offset}:{node.sourceMap?.end.offset})
          <DeleteIcon onClick={onDeleteBreakpoint(node)}/>
        </div>
      )}
    </div>
  )
}

export default BreakpointList