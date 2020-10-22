import React from 'react'

type EndingProps = { restart: () => void }
const Ending = ({ restart }: EndingProps) => {
  return <div>
    <p>Se terminó el juego</p>
    <button onClick={event => { event.preventDefault(); restart() }}>Restart</button>
  </div>
}

export default Ending