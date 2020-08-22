import React, { useContext } from 'react'
import SearchList from './SearchList'
import { qualifiedId } from './Utils'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'
import Instance from './Instance'


export type InstanceSearchListProps = { }

const InstanceSearchList = ({ }: InstanceSearchListProps) => {
  const { evaluation, instanceSearch, setInstanceSearch } = useContext(BytecodeDebuggerContext)

  return (
    <SearchList
      title = 'Instances'
      search={instanceSearch}
      setSearch={setInstanceSearch}
      elements={evaluation.listInstances()}
      searchTerms={instance => [qualifiedId(instance)]}
    >
      { instance => <Instance instance={instance} key={instance.id}/> }
    </SearchList>
  )
}

export default InstanceSearchList