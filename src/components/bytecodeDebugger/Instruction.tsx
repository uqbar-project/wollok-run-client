import { List } from 'wollok-ts'
import React, { ReactNode, memo } from 'react'
import Id from './Id'
import { CollapsibleName, moduleName } from './Utils'
import classNames from 'classnames'
import $ from './Instruction.module.scss'
import { Instruction as InstructionType } from 'wollok-ts/dist/interpreter/compiler'

const { isArray } = Array


export type InstructionProps = {
  instruction: InstructionType
  className?: string
}

const Instruction = ({ instruction, className }: InstructionProps)  => {
  const args: List<ReactNode> = (() => {
    switch(instruction.kind) {
      case 'LOAD': return [instruction.name]
      case 'STORE': return [instruction.name, instruction.lookup]
      case 'PUSH': return [<Id id={instruction.id} key='0' />]
      case 'PUSH_CONTEXT': return [instruction.exceptionHandlerIndexDelta]
      case 'SWAP': return [instruction.distance]
      case 'INSTANTIATE':  return [<CollapsibleName key='0' name={moduleName(instruction.moduleFQN)} />, isArray(instruction.innerValue) ? instruction.innerValue.map((id, index) => <Id id={id} key={index}/>) : instruction.innerValue]
      case 'INHERITS':  return [<CollapsibleName key='0' name={moduleName(instruction.moduleFQN)} />]
      case 'JUMP':
      case 'CONDITIONAL_JUMP': return [instruction.count]
      case 'CALL': return [`${instruction.message}/${instruction.arity}`, ...instruction.lookupStartFQN ? [instruction.lookupStartFQN] : []]
      case 'CALL_CONSTRUCTOR': return [<span key='0'><CollapsibleName name={moduleName(instruction.lookupStart)} />/${instruction.arity}</span>, `${instruction.optional}`]
      case 'INIT': return instruction.argumentNames
      default: return []
    }
  })()

  return (
    <div className={classNames($.container, className)}>
      {instruction.kind}
      {args.length ? '(' : ''}
      {args[0]}{args.slice(1).flatMap(arg => arg ? [', ', arg] : [])}
      {args.length ? ')' : ''}
    </div>
  )
}

export default memo(Instruction)