import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, WRENatives, ExecutionDirector } from 'wollok-ts'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'
import { game as gameInstance } from './GameStates'

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()

  const loadGame = (files: File[]) => {
    const project = buildGameProject(files)
    const environment = buildEnvironment(project.sources)
    const cleanEval = Evaluation.build(environment, WRENatives)
    const execution = new ExecutionDirector(cleanEval, cleanEval.exec(getProgramIn(project.main, environment)))
    const result = execution.finish()
    if (result.error) throw result.error //TODO: Revisar
    setGame(project)
    setEvaluation(cleanEval)
  }

  const title = evaluation ? gameInstance(evaluation)?.get('title')?.innerValue : ''

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