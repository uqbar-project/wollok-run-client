import React, { memo, useEffect, useState } from 'react'
import { RouteComponentProps } from '@reach/router'
import { buildEnvironment, Environment, Evaluation, List, validate, WRENatives } from 'wollok-ts'
import { Problem } from 'wollok-ts/dist/validator'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import FeaturedGames from './FeaturedGames'
import { clearGitRepo } from '../filesSelector/GitSelector'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'
import { LoadError, ValidationError } from './LoadError'

const { warn, info } = console

type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [error, setError] = useState<Error>()
  const [problems, setProblems] = useState<List<Problem>>()

  useEffect(() => {
    configTitle(evaluation)
  }, [evaluation])

  function backToFS() {
    clearGitRepo()
    setGame(undefined)
    setEvaluation(undefined)
  }

  const reloadGame = (files: File[], program: string) => {
    setError(undefined)
    loadGame(files, program)
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
    const warnings = validationProblems.filter(problem => problem.level === 'Warning')
    const errors = validationProblems.filter(problem => problem.level === 'Error')

    if (warnings.length) {
      warn(`FOUND ${warnings.length} WARNINGS IN LOADED GAME!`, warnings)
    }
    else info('NO WARNINGS FOUND IN LOADED GAME!')

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
    return <ValidationError problems={problems} callback={runGameAnyway} />

  if (error)
    return <LoadError error={error} reload={reloadGame} />

  if (!evaluation || !game)
    return <FilesSelector onFilesLoad={loadGame} >
      <FeaturedGames />
    </FilesSelector>


  return <div className={$.container}>
    <div>
      {/* <Menu /> */}
      <Sketch gameProject={game} evaluation={evaluation} exit={backToFS} />
    </div>
  </div>
}

function configTitle(evaluation: Evaluation | undefined) {
  const title = evaluation?.object('wollok.game.game')?.get('title')?.innerValue?.toString() || 'Game'
  document.title = title
}

export default memo(Game)