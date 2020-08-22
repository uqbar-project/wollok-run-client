import React, { useContext } from 'react'
import SearchList from './SearchList'
import { qualifiedId } from './Utils'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'


export type InstanceSearchListProps = { }

const InstanceSearchList = ({ }: InstanceSearchListProps) => {
  const { evaluation } = useContext(BytecodeDebuggerContext)
  return (
    <SearchList
      title = 'Instances'
      elements={evaluation.listInstances()}
      searchTerms={instance => [qualifiedId(instance)]}
    >
      { instance => (
        <div>{qualifiedId(instance)}</div>
      )}
    </SearchList>
  )
}

export default InstanceSearchList