import React, { useContext, memo } from 'react'
import { qualifiedId } from './Utils'
import { EvaluationContext, LayoutContext } from './BytecodeDebuggerContexts'
import Instance from './Instance'
import Section from './Section'
import SearchBar from './SearchBar'
import $ from './InstanceSearchList.module.scss'


export type InstanceSearchListProps = { }

const InstanceSearchList = ({ }: InstanceSearchListProps) => {
  const { evaluation } = useContext(EvaluationContext)
  const { instanceSearch, setInstanceSearch } = useContext(LayoutContext)

  const content = evaluation.instances
    .filter(instance => qualifiedId(instance).includes(instanceSearch))
    .map(instance => <Instance instance={instance} key={instance.id}/>)

  return (
    <Section
      title={`Instances (${content.length}/${evaluation.instances.length})`}
      titleDecoration={<SearchBar search={instanceSearch} setSearch={setInstanceSearch}/>}
      contentClassName={$.content}
    >
      {content}
    </Section>
  )
}

export default memo(InstanceSearchList)