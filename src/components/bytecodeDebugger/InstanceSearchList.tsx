import React, { useContext } from 'react'
import SearchList from './SearchList'
import { qualifiedId } from './Utils'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'
import Instance from './Instance'


export type InstanceSearchListProps = { }

const InstanceSearchList = ({ }: InstanceSearchListProps) => {
  const { evaluation } = useContext(BytecodeDebuggerContext)

  return (
    <SearchList
      title = 'Instances'
      elements={evaluation.listInstances()}
      searchTerms={instance => [qualifiedId(instance)]}
    >
      { instance => <Instance instance={instance} key={instance.id}/> }
    </SearchList>
  )
}

export default InstanceSearchList