import { RouteComponentProps } from '@reach/router'
import React, { memo, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, WRENatives } from 'wollok-ts'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'
import { LoadError } from './LoadError'
import { DrawerReadme } from '../DrawerReadme'

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    configTitle(evaluation)
  }, [evaluation])

  function backToFS() {
    setGame(undefined)
    setEvaluation(undefined)
  }
  const reloadGame = (files: File[], program: string) => {
    setError(undefined)
    loadGame(files, program)
  }

  const loadGame = (files: File[], program?: string) => {
    try {
      const project = buildGameProject(files, program)
      const environment = buildEnvironment(project.sources)
      const interpreter = interpret(environment, WRENatives)
      interpreter.exec(getProgramIn(project.main, environment))
      setGame(project)
      setEvaluation(interpreter.evaluation)
    }
    catch (exception) {
      if (exception instanceof Error) {
        setError(exception)
      }
    }
  }

  if (error)
    return <LoadError error={error} reload={reloadGame} />

  if (!evaluation || !game)
    return <FilesSelector onFilesLoad={loadGame} />

  return <div className={$.container}>
    <div>
      <Sketch gameProject={game} evaluation={evaluation} exit={backToFS} />
    </div>
  </div>
}

function configTitle(evaluation: Evaluation | undefined) {
  const title = evaluation?.object('wollok.game.game')?.get('title')?.innerValue?.toString() || 'Game'
  document.title = title
}

export default memo(Game)