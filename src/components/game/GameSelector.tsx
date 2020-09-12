import React, { memo, useState } from 'react'
import $ from './Game.module.scss'

const GameSelector = () => {
  const [gameUri, setGameUri] = useState<string>()

  const navigateToGame = () => {
    document.location.search = `github=${gameUri}`
  }

  return (
      <div className={$.game_selector}>
          <img src={'/wollok-logo.png'} width={'280px'} height={'90px'} alt={'wollok logo'}></img>
          <form  onSubmit={event => { event.preventDefault(); navigateToGame() }}>
              <div>
                  <label>Pegar URL de Github del juego a correr ( ͡° ͜ʖ ͡°) (ej: wollok/pepitagame)</label>
                  <input  type='text' onChange={event => setGameUri(event.target.value)} />
              </div>
              <button type='submit'>Cargar Juego</button>
          </form>
      </div>
  )
}

export default memo(GameSelector)