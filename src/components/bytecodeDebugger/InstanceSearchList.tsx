import React, { useContext, memo } from 'react'
import SearchList from './SearchList'
import { qualifiedId } from './Utils'
import { EvaluationContext, LayoutContext } from './BytecodeDebuggerContexts'
import Instance from './Instance'


export type InstanceSearchListProps = { }

const InstanceSearchList = ({ }: InstanceSearchListProps) => {
  const { evaluation } = useContext(EvaluationContext)
  const { instanceSearch, setInstanceSearch } = useContext(LayoutContext)

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

export default memo(InstanceSearchList)