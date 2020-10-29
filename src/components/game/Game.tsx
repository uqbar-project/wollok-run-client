import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { gameInstance } from './GameStates'
import { GameProject, buildGameProject, mainProgram } from './gameProject'

const natives = wre as Natives

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()

  const loadGame = (files: File[]) => {
    const project = buildGameProject(files)
    const environment = buildEnvironment(project.sources)
    const { buildEvaluation, runProgram } = interpret(environment, natives)
    const cleanEval = buildEvaluation()
    runProgram(mainProgram(project, environment), cleanEval)
    setGame(project)
    setEvaluation(cleanEval)
  }

  const title = evaluation ? evaluation.instance(gameInstance(evaluation).get('title')!.id).innerValue : ''

  return !evaluation || !game
    ? <FilesSelector onFilesLoad={loadGame} />
    : <div className={$.container}>
      <h1>{title}</h1>
      <div>
        <Sketch game={game} evaluation={evaluation} />
        <ReactMarkdown source={game.description} className={$.description} />
      </div>
    </div>
}

export default memo(Game)