import { Redirect, Router } from '@reach/router'
import whyDidYouRender from '@welldone-software/why-did-you-render'
import React from 'react'
import $ from './App.module.scss'
import Game from './Game'
import Worksheet from './worksheet/Worksheet'

// if (process.env.NODE_ENV !== 'production')
whyDidYouRender(React)

const App = () => {
  return (
    <Router className={$.app}>
      <Worksheet path='/worksheet' />
      <Game path='/game' />
      <Redirect from='/' to='/worksheet' default noThrow />
    </Router>
  )
}

export default App
