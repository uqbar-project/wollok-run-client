import { RouteComponentProps } from '@reach/router'
import React, { memo, useEffect, useState } from 'react'
import { buildEnvironment, Evaluation, WRENatives } from 'wollok-ts'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'
import { LoadProgramError } from './LoadProgramError'

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
    removeGitUrl()
  }
  const reloadGame = (files: File[], program: string) => {
    setError(undefined)
    loadGame(files, program)
  }
  const removeGitUrl = () => {
    const currentUrl = window.location.href

    if (typeof URLSearchParams !== 'undefined') {
      const url = new URL(currentUrl)
      const params = new URLSearchParams(url.search);
      if(params.has('git')) {
        params.delete('git')
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
      }
    }
    else {
      // Internet explorer does not support URLSearchParams
      if(currentUrl.includes('git')) {
        const splitUrl = currentUrl.split('git')
        window.location.href = splitUrl[0]
      }
    }
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
    return <LoadProgramError error={error} reload={reloadGame} />

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