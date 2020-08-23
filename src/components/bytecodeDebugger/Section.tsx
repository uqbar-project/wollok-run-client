import React, { ReactNode, memo, HTMLAttributes } from 'react'
import $ from './Section.module.scss'
import classNames from 'classnames'

export type SectionProps = {
  title: string
  titleDecoration?: ReactNode
  children: ReactNode
  contentClassName?: string
} & HTMLAttributes<HTMLDivElement>

const Section = ({ title, titleDecoration, children, contentClassName, className, ...props }: SectionProps) => {
  return (
    <div className={classNames($.container, className)} {...props}>
      <h2>{title}{titleDecoration}</h2>
      <div className={contentClassName}>{children}</div>
    </div>
  )
}

export default memo(Section)