import React, { createContext, ReactNode, useState } from 'react'
import { buildEnvironment, Environment, Evaluation, List, validate, WRENatives } from 'wollok-ts'
import { buildGameProject, GameProject, getProgramIn } from '../components/game/gameProject'
import { Problem } from 'wollok-ts/dist/validator'
import { clearGitRepo } from '../components/filesSelector/GitSelector'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import { File } from '../components/filesSelector/FilesSelector'
import { RouteComponentProps } from '@reach/router'

const { warn, info } = console

type GameProviderProps = RouteComponentProps & {
  children: ReactNode
}

interface GameState {
  game: GameProject | undefined
  evaluation: Evaluation | undefined
  error: Error | undefined
  problems: List<Problem> | undefined
  backToFS: () => void
  reloadGame: (files: File[], program: string) => void
  runGameAnyway: () => void
  runGame: (environment: Environment, project: GameProject) => void
  validateGame: (environment: Environment) => void
  loadGame: (files: File[], program?: string | undefined) => void
}

export const GameContext = createContext<GameState>({} as GameState)

export const GameProvider = ({ children }: GameProviderProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [error, setError] = useState<Error>()
  const [problems, setProblems] = useState<List<Problem>>()

  const clear = () => {
    setGame(undefined)
    setEvaluation(undefined)
    setError(undefined)
    setProblems(undefined)
  }

  const backToFS = () => {
    clearGitRepo()
    clear()
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
      console.log('CARGANDO EL JUEGO')
      const project = buildGameProject(files, program)
      const environment = buildEnvironment(project.sources)
      validateGame(environment)
      runGame(environment, project)
      console.log({game})
      console.log({evaluation})
    }
    catch (exception) {
      console.log('SE PRODUJO UN ERROR')
      if (exception instanceof Error) {
        setError(exception)
      }
    }
  }

  const value = {
    game,
    evaluation,
    error,
    problems,
    backToFS,
    reloadGame,
    runGameAnyway,
    runGame,
    validateGame,
    loadGame,
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}