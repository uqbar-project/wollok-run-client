import React from 'react'
import { Button } from '@material-ui/core'
import ReplayIcon from '@material-ui/icons/Replay'

type EndingProps = { restart: () => void }
const Ending = ({ restart }: EndingProps) => {
  return <div>
    <h1>Se terminó el juego</h1>
    <Button onClick={event => { event.preventDefault(); restart() }} variant="contained" color="primary" startIcon={<ReplayIcon />}>Reiniciar el juego</Button>
  </div>
}

export default Ending