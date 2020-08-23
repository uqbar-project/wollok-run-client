import React, { ReactNode, memo } from 'react'
import { List } from 'wollok-ts'
import classNames from 'classnames'
import $ from './Stack.module.scss'
import { ScrollTarget } from './Utils'


export type Stackable = {
  label: ReactNode
  subLabel?: ReactNode
  selected?: boolean
  onClick?: () => void
}

export type StackProps = {
  elements: List<Stackable>
}

const Stack = ({ elements }: StackProps) => {
  return (
    <div className={$.container}>
      {elements.map((element, index) => (
        <ScrollTarget
          scrollIntoView={element.selected}
          onClick={element.onClick}
          className={classNames($.element, {
            [$.highlighted]: element.selected,
            [$.clickable]: !!element.onClick && !element.selected,
          })}
          key={index}
        >
          <div>{element.label}</div>
          <div>{element.subLabel}</div>
        </ScrollTarget>
      ))}
    </div>
  )
}

export default memo(Stack)

Stack.whyDidYouRender = true