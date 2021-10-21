import React, { memo, useContext, useEffect } from 'react'
import { RouteComponentProps } from '@reach/router'
import { Evaluation } from 'wollok-ts'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import FeaturedGames from './FeaturedGames'
import FilesSelector from '../filesSelector/FilesSelector'
import { LoadError, ValidationError } from './LoadError'
import { GameContext } from '../../context/GameContext'

type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const {
    problems, error, evaluation, game,
    runGameAnyway, reloadGame, loadGame, backToFS,
  } = useContext(GameContext)

  useEffect(() => {
    configTitle(evaluation)
  }, [evaluation])

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