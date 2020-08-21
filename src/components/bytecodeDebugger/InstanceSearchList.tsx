import React from 'react'
import SearchList from './SearchList'
import { Evaluation } from 'wollok-ts'
import { qualifiedId } from './Utils'


export type InstanceSearchListProps = {
  evaluation: Evaluation
}

const InstanceSearchList = ({ evaluation }: InstanceSearchListProps) => {
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