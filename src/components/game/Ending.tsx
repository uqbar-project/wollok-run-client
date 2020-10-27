import React from 'react'
import { Button } from '@material-ui/core'
import ReplayIcon from '@material-ui/icons/Replay'

type RestartProps = { restart: () => void }
export function RestartButton(props: RestartProps) {
  return <Button onClick={event => { event.preventDefault(); props.restart() }} variant="contained" color="primary" startIcon={<ReplayIcon />}>Reiniciar el juego</Button>
}


type EndingProps = {
  restartProps: RestartProps
}

const Ending = (props: EndingProps) => {
  return <div>
    <h1>Se terminó el juego</h1>
    <RestartButton {...props.restartProps} />
  </div>
}

export default Ending