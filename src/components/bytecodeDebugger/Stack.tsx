import React, { ReactNode, memo } from 'react'
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
  stack?: Stackable[]
}

const Stack = ({ stack = [] }: StackProps) => {
  return (
    <div className={$.container}>
      {stack.map((element, index) => (
        <ScrollTarget
          scrollIntoView={element.selected}
          key={index}
        >
          <div
            onClick={element.onClick}
            className={classNames($.element, {
              [$.highlighted]: element.selected,
              [$.clickable]: !!element.onClick && !element.selected,
            })}
          >
            <div>{element.label}</div>
            <div>{element.subLabel}</div>
          </div>
        </ScrollTarget>
      ))}
    </div>
  )
}

export default memo(Stack)