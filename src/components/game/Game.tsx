import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, WRENatives } from 'wollok-ts'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()

  const loadGame = (files: File[]) => {
    const project = buildGameProject(files)
    const environment = buildEnvironment(project.sources)
    const interpreter = interpret(environment, WRENatives)
    interpreter.exec(getProgramIn(project.main, environment))
    setGame(project)
    setEvaluation(interpreter.evaluation)
  }

  const title = evaluation ? evaluation.object('wollok.game.game')?.get('title')?.innerValue : ''

  return !evaluation || !game
    ? <FilesSelector onFilesLoad={loadGame} />
    : <div className={$.container}>
      <h1>{title}</h1>
      <div>
        <Sketch gameProject={game} evaluation={evaluation} />
        <ReactMarkdown source={game.description} className={$.description} />
      </div>
    </div>
}

export default memo(Game)