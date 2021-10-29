import React, { ReactNode, useContext } from 'react'
import { GameContext } from '../context/GameContext'
import { BackArrowTo } from './BackArrow'
import $ from './ErrorScreen.module.scss'
import { WollokLogo } from './Home/Home'

export type ErrorProps = {
  title?: string
  children: ReactNode
}

export interface BaseErrorProps {
  title?: string
  description: string
  children?: ReactNode
  bottom?: ErrorBottomProps
}

export interface ErrorBottomProps {
  children?: ReactNode
}

export const ErrorScreen = ({ title, children }: ErrorProps) => {
  return (
    <div className={$.error}>
      <WollokLogo />
      <br />
      <div>
        <h1 style={{ textAlign: 'center' }}> {title || 'Se ha producido un error'} </h1>
        { children }
      </div>
    </div>
  )
}

export const BaseErrorScreen = (props: BaseErrorProps) => {
  return (
    <ErrorScreen title = { props.title }>
      <p style={{ marginTop: '5px', marginBottom: '5px' }}>
        { props.description }
      </p>
      { props.children }
      <ErrorBottom { ... props.bottom }/>
    </ErrorScreen>
  )
}

export const ErrorBottom = (props: ErrorBottomProps) => {
  const { backToFS } = useContext(GameContext)
  return (
    <div style={{ paddingTop: '2%' }}>
      <BackArrowTo action={backToFS} />
      { props.children }
    </div>
  )
}