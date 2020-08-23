import React, { ReactNode, memo } from 'react'
import $ from './Section.module.scss'

export type SectionProps = {
  title: string
  titleDecoration?: ReactNode
  children: ReactNode
  containerClassName?: string
}

const Section = ({ title, titleDecoration, children, containerClassName }: SectionProps) => {
  return (
    <div className={$.container}>
      <h2>{title}{titleDecoration}</h2>
      <div className={containerClassName}>{children}</div>
    </div>
  )
}

export default memo(Section)