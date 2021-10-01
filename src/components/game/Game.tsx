import { RouteComponentProps } from '@reach/router'
import React, { memo, useEffect, useState } from 'react'
import { buildEnvironment, Environment, Evaluation, List, validate, WRENatives } from 'wollok-ts'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'
import { LoadError, ValidationError } from './LoadError'
import { Problem } from 'wollok-ts/dist/validator'

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [error, setError] = useState<Error>()
  const [problems, setProblems] = useState<List<Problem>>()

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
      const params = new URLSearchParams(url.search)
      if(params.has('git')) {
        params.delete('git')
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`)
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

  const runGameAnyway = () => {
    setProblems(undefined)
  }

  const runGame = (environment: Environment, project: GameProject) => {
    const interpreter = interpret(environment, WRENatives)
    interpreter.exec(getProgramIn(project.main, environment))
    setGame(project)
    setEvaluation(interpreter.evaluation)
  }

  const validateGame = (environment: Environment) => {
    const validationProblems = validate(environment)
    const warnings = validationProblems.filter(problem => problem.level === 'warning')
    const errors = validationProblems.filter(problem => problem.level === 'error')

    if (warnings.length){
      console.warn(`FOUND ${warnings.length} WARNINGS IN LOADED GAME!`, warnings)
    }
    else console.info('NO WARNINGS FOUND IN LOADED GAME!')

    if (errors.length)
      setProblems(errors)
  }

  const loadGame = (files: File[], program?: string) => {
    try {
      const project = buildGameProject(files, program)
      const environment = buildEnvironment(project.sources)
      validateGame(environment)
      runGame(environment, project)
    }
    catch (exception) {
      if (exception instanceof Error) {
        setError(exception)
      }
    }
  }

  if (problems)
    return <ValidationError problems = { problems } callback = { runGameAnyway }/>

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