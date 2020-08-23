import { List, Id as IdType } from 'wollok-ts'
import { RuntimeObject, Evaluation, Context } from 'wollok-ts/dist/interpreter'
import React, { useRef, useEffect, HTMLAttributes, memo } from 'react'


export const shortId = (id: IdType) => `#${id.slice(id.lastIndexOf('-') + 1)}`

export const qualifiedId = (instance: RuntimeObject) => `${instance.moduleFQN}${shortId(instance.id)}`

export const contextHierarchy = (evaluation: Evaluation, start: IdType | null): List<Context> => {
  if(!start) return []
  const context = evaluation.context(start)
  return [context, ...contextHierarchy(evaluation, context.parent)]
}


export type ScrollTargetProps = HTMLAttributes<HTMLDivElement> & {
  scrollIntoView?: boolean
}

// eslint-disable-next-line react/display-name
export const ScrollTarget = memo(({ scrollIntoView, ...props }: ScrollTargetProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(scrollIntoView) ref.current?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' })
  }, [scrollIntoView, ref])

  return <div {...props} ref={ref}/>
})

ScrollTarget.whyDidYouRender = true