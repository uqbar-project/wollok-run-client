import { List, Id as IdType } from 'wollok-ts'
import { Instruction as InstructionType, RuntimeObject } from 'wollok-ts/dist/interpreter'
import React, { ReactNode, useRef, useEffect, HTMLAttributes } from 'react'
import $ from './Utils.module.scss'

const { isArray } = Array

export const shortId = (id: IdType) => `#${id.slice(id.lastIndexOf('-') + 1)}`
export const qualifiedId = (instance: RuntimeObject) => `${instance.moduleFQN}${shortId(instance.id)}`

export type IdProps = { id: IdType }

export const Id = ({ id }: IdProps) => (
  <div className={$.id}>{shortId(id)}</div>
)

export type InstructionProps = {
  instruction: InstructionType
  className?: string
}

export const Instruction = ({ instruction, className }: InstructionProps)  => {
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


export type ScrollTargetProps = HTMLAttributes<HTMLDivElement> & {
  scrollIntoView?: boolean
}

export const ScrollTarget = ({ scrollIntoView, ...props }: ScrollTargetProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(scrollIntoView) ref.current?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' })
  }, [scrollIntoView, ref])

  return <div {...props} ref={ref}/>
}