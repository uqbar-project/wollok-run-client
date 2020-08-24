import { List, Id as IdType } from 'wollok-ts'
import { RuntimeObject, Evaluation, Context } from 'wollok-ts/dist/interpreter'
import React, { useRef, useEffect, HTMLAttributes, memo } from 'react'


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


export const shortId = (id: IdType) => `#${id.slice(id.lastIndexOf('-') + 1)}`

export const qualifiedId = (instance: RuntimeObject) => `${instance.moduleFQN}${shortId(instance.id)}`

export const contextHierarchy = (evaluation: Evaluation, start?: IdType | null): List<Context> => {
  if(!start) return []
  const context = evaluation.context(start)
  return [context, ...contextHierarchy(evaluation, context.parent)]
}


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