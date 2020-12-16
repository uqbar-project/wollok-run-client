import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, mainProgram } from './gameProject'
import { IconButton } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

const natives = wre as Natives

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [showReadme, setShowReadme] = useState<boolean>(true)
  const handleReadme = () => {
    setShowReadme(!showReadme)
  }


  const loadGame = (files: File[]) => {
    const project = buildGameProject(files)
    const environment = buildEnvironment(project.sources)
    const { buildEvaluation, runProgram } = interpret(environment, natives)
    const cleanEval = buildEvaluation()
    runProgram(mainProgram(project, environment), cleanEval)
    setGame(project)
    setEvaluation(cleanEval)
  }

  return !evaluation || !game
    ? <FilesSelector onFilesLoad={loadGame} />
    : <div className={$.container}>
      <div>
        <Sketch game={game} evaluation={evaluation} />
        <div><IconButton color='primary' onClick={handleReadme}> <MenuIcon /> </IconButton></div>
        {showReadme && (<ReactMarkdown source={game.description} className={$.description} />)}
      </div>
    </div>
}

export default memo(Game)