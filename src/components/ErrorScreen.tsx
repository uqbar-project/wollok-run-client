import React from 'react'
import { BackArrow } from './BackArrow'
import $ from './ErrorScreen.module.scss'
import { WollokLogo } from './Home/Home'


type ErrorProps = { innerCode: any }
export const ErrorScreen = (props: ErrorProps) => {
    return <div className={$.error}>
    <WollokLogo />
    <br />
    <div>
      <h1 style={{ textAlign: 'center' }}> Se ha producido un error </h1>
      {props.innerCode}
    </div>
  </div>
}