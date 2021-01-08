import { List, Id as IdType, RuntimeObject, Evaluation, Context, LazyInitializer } from 'wollok-ts'
import React, { useRef, useEffect, HTMLAttributes, memo } from 'react'
import $ from './Utils.module.scss'

declare global {
  interface File {
    webkitRelativePath: string
  }
}

declare module 'react' {
  interface InputHTMLAttributes<T extends HTMLInputElement> {
    webkitdirectory?: string
  }
}


export const shortId = (id?: IdType) => id ? `#${id.slice(id.lastIndexOf('-') + 1)}` : 'void'

export const qualifiedId = (value: RuntimeObject | LazyInitializer) => value instanceof LazyInitializer
  ? '<<LAZY>>'
  : `${moduleName(value.module.fullyQualifiedName())}${shortId(value.id)}`

export const moduleName = (name: string) => name.includes('#')
  ? `${name.slice(0, name.indexOf('#'))}#${name.slice(name.lastIndexOf('-')+1)}`
  : name

export const contextHierarchy = (evaluation: Evaluation, context?: Context): List<Context> => {
  if(!context) return []
  return [context, ...contextHierarchy(evaluation, context.parentContext)]
}


export type CollapsibleNameProps = { name: string }

const _CollapsibleName = ({ name: qualifiedName }: CollapsibleNameProps) => {
  const breakpoint = qualifiedName.lastIndexOf(qualifiedName.includes(' ') ? ' ' : '.') + 1
  const qualifier = qualifiedName.slice(0, breakpoint)
  const name = qualifiedName.slice(breakpoint)
  return <div className={$.collapsible}>{qualifier.length > 0 && <span>{qualifier}</span>}<span>{name}</span></div>
}

export const CollapsibleName = memo(_CollapsibleName)


export type ScrollTargetProps = HTMLAttributes<HTMLDivElement> & {
  scrollIntoView?: boolean
}

const _ScrollTarget = ({ scrollIntoView, ...props }: ScrollTargetProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(scrollIntoView) ref.current?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' })
  }, [scrollIntoView, ref])

  return <div {...props} ref={ref}/>
}

export const ScrollTarget = memo(_ScrollTarget)