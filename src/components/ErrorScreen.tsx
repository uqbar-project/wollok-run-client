import React from 'react'
import { BackArrow } from './BackArrow'
import $ from './ErrorScreen.module.scss'
import { WollokLogo } from './Home/Home'


type ErrorProps = { message: String }
export const ErrorScreen = (props: ErrorProps) => {
  return <div className={$.error}>
    <WollokLogo />
    <br />
    <div>
      <h1 style={{ textAlign: 'center' }}> Se ha producido un error </h1>
      <p style={{ marginTop: '5px', marginBottom: '5px' }}>{props.message}
      </p>
      <div style={{ paddingTop: '2%' }}>
        <BackArrow returnPath='/' />
      </div>
    </div>
  </div>
}