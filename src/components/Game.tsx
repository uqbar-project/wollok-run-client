import { RouteComponentProps } from '@reach/router'
import useEventListener from '@use-it/event-listener'
import React, { KeyboardEvent, memo, useEffect, useState } from 'react'
import useInterval from 'use-interval'
import { v4 as uuid } from 'uuid'
import { buildEnvironment, Evaluation, Id, interpret } from 'wollok-ts/dist/src'
import natives from 'wollok-ts/dist/src/wre/wre.natives'
import $ from './Game.module.scss'
import Spinner from './Spinner'

const FPS = 30

const game = {
  cwd: 'games/pepita',
  main: 'pepitaGame.PepitaGame',
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
}

const fetchFile = async (path: string) => {
  const source = await fetch(`${game.cwd}/${path}`)
  const name = source.url.slice(source.url.lastIndexOf('/') + 1)
  const content = await source.text()
  return { name, content }
}

type BoardProps = { board: string[][][] }
const Board = ({ board }: BoardProps) => {
  return (
    <div className={$.board}>
      {board.map((row, y) =>
        <div key={y}>
          {row.map((cell, x) =>
            <div key={x}>
              {cell.map((image, i) =>
                <img key={i} src={image} alt={image} />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const gameInstance = ({ environment, instances }: Evaluation) => {
  return instances[environment.getNodeByFQN('wollok.game.game').id]
}

const emptyBoard = (evaluation: Evaluation) => {
  const gameInst = gameInstance(evaluation)
  const width = evaluation.instances[gameInst.fields.width].innerValue
  const height = evaluation.instances[gameInst.fields.height].innerValue
  const ground = evaluation.instances[gameInst.fields.ground] &&
    `${game.cwd}/assets/${evaluation.instances[gameInst.fields.ground].innerValue}`
  return Array.from(Array(height), () =>
    Array.from(Array(width), () => ground ? [ground] : [])
  )
}

export type GameProps = RouteComponentProps
const Game = ({ }: GameProps) => {

  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [board, setBoard] = useState<string[][][]>([])


  useEffect(() => {
    Promise.all(game.sources.map(fetchFile)).then(files => {
      const environment = buildEnvironment(files)
      const { buildEvaluation, runProgram } = interpret(environment, natives)
      const cleanEval = buildEvaluation()

      runProgram(game.main, cleanEval)

      setEvaluation(cleanEval)
      setBoard(emptyBoard(cleanEval))
    })
  }, [])

  // TODO: Remove any once https://github.com/facebook/react/issues/14102 is fixed
  useEventListener<KeyboardEvent>('keydown', (event: any) => {
    if (!evaluation) return

    event.preventDefault()

    const id = uuid()
    evaluation.instances['S!keydown'] = { id: 'S!keydown', module: 'wollok.lang.String', fields: {}, innerValue: 'keydown' }
    evaluation.instances[`S!${event.code}`] = { id: `S!${event.code}`, module: 'wollok.lang.String', fields: {}, innerValue: event.code }
    evaluation.instances[id] = { id, module: 'wollok.lang.List', fields: {}, innerValue: ['S!keydown', `S!${event.code}`] }

    const { sendMessage } = interpret(evaluation.environment, natives)
    sendMessage('queueEvent', evaluation.environment.getNodeByFQN('wollok.lang.io').id, id)(evaluation)

    setEvaluation(evaluation)
  })

  useInterval(() => {
    if (!evaluation) return

    const { sendMessage } = interpret(evaluation.environment, natives)

    sendMessage('flushEvents', evaluation.environment.getNodeByFQN('wollok.lang.io').id)(evaluation)

    const visuals = evaluation.instances[gameInstance(evaluation).fields.visuals].innerValue
    const currentVisualStates = visuals.map((id: Id) => {
      const currentFrame = evaluation.frameStack[evaluation.frameStack.length - 1]

      sendMessage('position', id)(evaluation)
      const position = evaluation.instances[currentFrame.operandStack.pop()!]
      const x = evaluation.instances[position.fields.x].innerValue
      const y = evaluation.instances[position.fields.y].innerValue

      sendMessage('image', id)(evaluation)
      const image = evaluation.instances[currentFrame.operandStack.pop()!].innerValue

      return { position: { x, y }, image }
    })

    const current = JSON.stringify(board)
    const next = emptyBoard(evaluation)
    for (const { position: { x, y }, image } of currentVisualStates) {
      next[y][x].push(`${game.cwd}/assets/${image}`)
    }

    if (JSON.stringify(next) !== current) setBoard(next)

    setEvaluation(evaluation)

  }, 1000 / FPS)

  const title = evaluation ? evaluation.instances[gameInstance(evaluation).fields.title].innerValue : ''

  return (
    <div className={$.container}>
      {evaluation
        ? <>
          <h1>{title}</h1>
          <div>
            <Board board={board} />
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