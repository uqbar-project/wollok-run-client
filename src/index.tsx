import { Redirect, Router } from '@reach/router'
import whyDidYouRender from '@welldone-software/why-did-you-render'
import 'rc-tooltip/assets/bootstrap_white.css'
import React from 'react'
import ReactDOM from 'react-dom'
import 'react-splitter-layout/lib/index.css'
import Game from './components/Game'
import Worksheet from './components/worksheet/Worksheet'
import './index.scss'
import * as serviceWorker from './serviceWorker'

if (process.env.NODE_ENV !== 'production') whyDidYouRender(React)

const Routes = () => (
  <Router>
    <Worksheet path='/worksheet' />
    <Game path='/game' />
    <Redirect from='/' to='/worksheet' default noThrow />
  </Router>
)

ReactDOM.render(<Routes />, document.getElementById('root'))

serviceWorker.unregister()
