import { Redirect, Router } from '@reach/router'
import whyDidYouRender from '@welldone-software/why-did-you-render'
import 'rc-tooltip/assets/bootstrap_white.css'
import React from 'react'
import ReactDOM from 'react-dom'
import 'react-splitter-layout/lib/index.css'
import Game from './components/game/Game'
import Worksheet from './components/worksheet/Worksheet'
import './index.scss'
import * as serviceWorker from './serviceWorker'
import BytecodeDebugger from './components/bytecodeDebugger/BytecodeDebugger'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/core/styles'

const wollokTheme = createMuiTheme({
  palette: {
    primary: { main: '#ac4142' },
    secondary: { main: '#7283a7' },
  },
})

if (process.env.NODE_ENV !== 'production') whyDidYouRender(React, { trackHooks: true })

const Routes = () => (
  <ThemeProvider theme={wollokTheme}>
    <Router>
      <Worksheet path='/worksheet' />
      <Game path='/game' />
      <BytecodeDebugger path='/debugger' />
      <Redirect from='/' to='/worksheet' default noThrow />
    </Router>
  </ThemeProvider>
)

const root = document.getElementById('root')!

root.style.height = `${window.innerHeight}px`
window.addEventListener('resize', () => {
  root.style.height = `${window.innerHeight}px`
})

ReactDOM.render(<Routes />, root)

serviceWorker.unregister()