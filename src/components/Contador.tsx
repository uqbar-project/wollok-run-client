import React, { useContext } from 'react'

import { Context } from '../context/Context'

export const Contador = () => {
  const { count, decrement, increment } = useContext(Context)

  return (
    <div>
      <div>
        <h2>
          Contador
        </h2>
      </div>
      <div>
        <button onClick={decrement}> - </button>
        <p> {count}</p>
        <button onClick={increment}> + </button>
      </div>
    </div>
  )
}
