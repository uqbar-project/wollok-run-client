import { List } from 'wollok-ts'
import { Instruction as InstructionType } from 'wollok-ts/dist/interpreter'
import React, { ReactNode, memo } from 'react'
import Id from './Id'

const { isArray } = Array


export type InstructionProps = {
  instruction: InstructionType
  className?: string
}

const Instruction = ({ instruction, className }: InstructionProps)  => {
  const args: List<ReactNode> = (() => {
    switch(instruction.kind) {
      case 'LOAD': return [instruction.name, instruction.lazyInitialization ? 'lazy' : undefined]
      case 'STORE': return [instruction.name, instruction.lookup]
      case 'PUSH': return [<Id id={instruction.id} key='0' />]
      case 'PUSH_CONTEXT': return [instruction.exceptionHandlerIndexDelta]
      case 'SWAP': return [instruction.distance]
      case 'INSTANTIATE':  return [instruction.module, isArray(instruction.innerValue) ? instruction.innerValue.map((id, index) => <Id id={id} key={index}/>) : instruction.innerValue]
      case 'INHERITS':  return [instruction.module]
      case 'JUMP':
      case 'CONDITIONAL_JUMP': return [instruction.count]
      case 'CALL': return [`${instruction.message}/${instruction.arity}`, `${instruction.useReceiverContext}`, instruction.lookupStart]
      case 'INIT': return [`${instruction.lookupStart}/${instruction.arity}`, `${instruction.optional}`]
      case 'INIT_NAMED': return instruction.argumentNames
      default: return []
    }
  })()

  return (
    <div className={className}>
      {instruction.kind}
      {args.length ? '(' : ''}
      {args[0]}{args.slice(1).flatMap(arg => arg ? [', ', arg] : [])}
      {args.length ? ')' : ''}
    </div>
  )
}

export default memo(Instruction)