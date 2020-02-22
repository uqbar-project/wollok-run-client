import { RouteComponentProps } from '@reach/router'
import p5 from 'p5'
import React, { memo, useEffect, useState } from 'react'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import $ from './Game.module.scss'
import sketch from './sketch'
import { gameInstance } from './sketch'
import Spinner from './Spinner'

const natives = wre as Natives

const fetchFile = async (path: string) => {
  const source = await fetch(`${game.cwd}/${path}`)
  const name = source.url.slice(source.url.lastIndexOf('/') + 1)
  const dir = game.cwd.slice(game.cwd.lastIndexOf('/') + 1)
  const content = await source.text()
  return { name: `${dir}/${name}`, content }
}
const imagePaths = [
  'alpiste.png',
  'ciudad.png',
  'fondo2.jpg',
  'fondo.jpg',
  'jugador.png',
  'manzana.png',
  'muro.png',
  'pepita1.png',
  'pepita2.png',
  'pepitaCanchera.png',
  'pepita-gorda-raw.png',
  'pepita.png',
  'pepona.png',
  'suelo.png',
]

// const game = {
//   cwd: 'games/2019-o-tpi-juego-loscuatrofantasticos',
//   main: 'juego.ejemplo',
//   sources: [
//     'src/elementos.wlk',
//     'src/personajes.wlk',
//     'src/mundos.wlk',
//     'src/juego.wpgm',
//   ],
//   description: `
//     - Agarrá los fueguitos y evitá todo lo demas!
//   `,
//   imagePaths,
// }

const game = {
  cwd: 'games/pepita',
  main: 'pepita.pepitaGame.PepitaGame',
  sources: [
    'src/ciudades.wlk',
    'src/comidas.wlk',
    'src/pepita.wlk',
    'src/pepitaGame.wpgm',
  ],
  description: `
    - Presioná [↑] para ir hacia arriba.\n
    - Presioná [↓] para ir hacia abajo.\n
    - Presioná [←] para ir hacia la izquierda.\n
    - Presioná [→] para ir hacia la derecha.\n
    - Presioná [B] para ir a Buenos Aires.\n
    - Presioná [V] para ir a Villa Gesell.
  `,
  imagePaths,
}

type BoardProps = { sketch: (sketch: p5) => void }
class GameBoard extends React.Component<BoardProps> {

  private wrapper: React.RefObject<HTMLDivElement> = React.createRef()

  componentDidMount() {
    this.setSketch(this.props)
  }

  componentWillReceiveProps(newprops: BoardProps) {
    if (this.props.sketch !== newprops.sketch) {
      this.setSketch(newprops)
    }
  }

  setSketch(props: BoardProps) {
    const current = this.wrapper.current
    if (current) {
      if (current.childNodes[0]) {
        current.removeChild(current.childNodes[0])
      }
      // tslint:disable-next-line: no-unused-expression
      new p5(props.sketch, current)
    }
  }

  render() {
    return (
      <div ref={this.wrapper} />
    )
  }
}

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [evaluation, setEvaluation] = useState<Evaluation>()

  useEffect(() => {
    Promise.all(game.sources.map(fetchFile)).then(files => {
      const environment = buildEnvironment(files)
      const { buildEvaluation, runProgram } = interpret(environment, natives)
      const cleanEval = buildEvaluation()
      runProgram(game.main, cleanEval)
      setEvaluation(cleanEval)
    })
  }, [])


  const title = evaluation ? evaluation.instances[gameInstance(evaluation).get('title')!.id].innerValue : ''

  return (
    <div className={$.container}>
      {evaluation
        ? <>
          <h1>{title}</h1>
          <div>
            <GameBoard sketch={sketch(game, evaluation)} />
            <div className={$.description}>
              {game.description.split('\n').map((line, i) =>
                <div key={i}>{line}</div>
              )}
            </div>
          </div>
        </>
        : <Spinner />
      }
    </div>
  )
}

export default memo(Game)