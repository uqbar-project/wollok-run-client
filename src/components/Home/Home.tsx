import { Button, ButtonGroup } from '@material-ui/core'
import { Link, RouteComponentProps } from '@reach/router'
import React from 'react'
import { Provider } from '../../context/Context'
import Contador from '../contador'

import $ from './Home.module.scss'

export const WollokLogo = ({ }: RouteComponentProps) => {
  return <img src={'/wollok-logo.png'} width={280} height={90} alt={'wollok logo'} className="logo" />
}

export const Home = ({ }: RouteComponentProps) => {
  return <div className={$.container}>
    <WollokLogo />
    <div className={$.buttons}>
      <ButtonGroup
        size="large"
        orientation="vertical"
        variant="contained"
        color="primary">
        <Button component={Link} to={'/game'} variant="contained" color="primary">Game</Button>
        <Button component={Link} to={'/debugger'} variant="contained" color="primary" >Debugger</Button>
        <Button component={Link} to={'/worksheet'} variant="contained" color="primary">Worksheet</Button>
      </ButtonGroup>
      <Provider>
        <Contador />
      </Provider>
    </div>
  </div>
}