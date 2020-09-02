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

  const elements = evaluation.listInstances()
  const content = elements
    .filter(element => qualifiedId(element).includes(instanceSearch))
    .map(element => <Instance instance={element} key={element.id}/>)

  return (
    <Section
      title={`Instances (${content.length}/${elements.length})`}
      titleDecoration={<SearchBar search={instanceSearch} setSearch={setInstanceSearch}/>}
      contentClassName={$.content}
    >
      {content}
    </Section>
  )
}

export default memo(InstanceSearchList)