import { RouteComponentProps } from '@reach/router'
import p5 from 'p5'
import React, { memo, useEffect, useState } from 'react'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import natives from 'wollok-ts/dist/wre/wre.natives'
import $ from './Game.module.scss'
import sketch from './sketch'
import { gameInstance } from './sketch'
import Spinner from './Spinner'

const fetchFile = async (path: string) => {
  const source = await fetch(`${game.cwd}/${path}`)
  const name = source.url.slice(source.url.lastIndexOf('/') + 1)
  const content = await source.text()
  return { name, content }
}
const imagePaths = [
  'agua.png',
  'capturaJuego.png',
  'desierto.jpg',
  'DonFuego.png',
  'DonRoca.png',
  'elementoRadioactivo.png',
  'fantasticos.jpg',
  'fire.gif',
  'pepita-grande.png',
  'pepita-gris.png',
  'pocionNaranja.png',
  'suelo.png',
  'thumbnail_12.png',
  'thumbnail_13.png',
  'thumbnail_14.png',
  'thumbnail_16.png',
  'thumbnail_1.png',
  'thumbnail_3.png',
  'thumbnail_44.png',
  'thumbnail_8.png',
  'tierra.jpg',
]

const game = {
  cwd: 'games/2019-o-tpi-juego-loscuatrofantasticos',
  main: 'juego.ejemplo',
  sources: [
    'src/elementos.wlk',
    'src/personajes.wlk',
    'src/mundos.wlk',
    'src/juego.wpgm',
  ],
  description: `
    - Agarrá los fueguitos y evitá todo lo demas!
  `,
  imagePaths,
}

// const game = {
//   cwd: 'games/pepita',
//   main: 'pepitaGame.PepitaGame',
//   sources: [
//     'src/ciudades.wlk',
//     'src/comidas.wlk',
//     'src/pepita.wlk',
//     'src/pepitaGame.wpgm',
//   ],
//   description: `
//     - Presioná [↑] para ir hacia arriba.\n
//     - Presioná [↓] para ir hacia abajo.\n
//     - Presioná [←] para ir hacia la izquierda.\n
//     - Presioná [→] para ir hacia la derecha.\n
//     - Presioná [B] para ir a Buenos Aires.\n
//     - Presioná [V] para ir a Villa Gesell.
//   `,
// }

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
// const Board = ({ board }: BoardProps) => {
//   return (
//     <div className={$.board}>
//       {board.map((row, y) =>
//         <div key={y}>
//           {row.map((cell, x) =>
//             <div key={x}>
//               {cell.map(({img, dialog}, i) =>
//                 <div key={i}>
//                   <img src={img} alt={img} />
//                   <span>{dialog}</span>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }


export type GameProps = RouteComponentProps
const Game = ({ }: GameProps) => {
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