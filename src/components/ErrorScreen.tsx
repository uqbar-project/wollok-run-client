import React, { ReactNode } from 'react'
import { BackArrow } from './BackArrow'
import $ from './ErrorScreen.module.scss'
import { WollokLogo } from './Home/Home'

export type ErrorProps = {
  children: ReactNode
}

export interface BaseErrorProps {
  description: string
  children?: ReactNode
  bottom?: ErrorBottomProps
}

export interface ErrorBottomProps {
  children?: ReactNode
}

export const ErrorScreen = ({ children }: ErrorProps) => {
  return (
    <div className={$.error}>
      <WollokLogo />
      <br />
      <div>
        <h1 style={{ textAlign: 'center' }}> Se ha producido un error </h1>
        { children }
      </div>
    </div>
  )
}

export const BaseErrorScreen = (props: BaseErrorProps) => {
  return (
    <ErrorScreen>
      <p style={{ marginTop: '5px', marginBottom: '5px' }}>
        { props.description }
      </p>
      { props.children }
      <ErrorBottom { ... props.bottom }/>
    </ErrorScreen>
  )
}

export const ErrorBottom = (props: ErrorBottomProps) => {
  return (
    <div style={{ paddingTop: '2%' }}>
      <BackArrow returnPath='/' />
      { props.children }
    </div>
  )
}