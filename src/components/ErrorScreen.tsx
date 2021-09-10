import React, { ReactNode } from 'react'
import $ from './ErrorScreen.module.scss'
import { WollokLogo } from './Home/Home'

export type ErrorProps = {
  children: ReactNode
}
export const ErrorScreen = ({ children }: ErrorProps) => {
  return <div className={$.error}>
    <WollokLogo />
    <br />
    <div>
      <h1 style={{ textAlign: 'center' }}> Se ha producido un error </h1>
      {children}
    </div>
  </div>
}