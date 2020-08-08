import React, { memo, useState } from 'react'

const GameSelector = () => {
  const [gameUri, setGameUri] = useState<string>()

  const navigateToGame = () => {
    document.location.search = `github=${gameUri}`
  }

  return (
    <form onSubmit={event => { event.preventDefault(); navigateToGame() }}>
      <input type='text' onChange={event => setGameUri(event.target.value)} />
      <button type='submit'>Cargar</button>
    </form>
  )
}

export default memo(GameSelector)