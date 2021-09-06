import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, WRENatives } from 'wollok-ts'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn } from './gameProject'
import { WollokLogo } from '../Home/Home'
import { CenterFocusStrong } from '@material-ui/icons'

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [error, setError] = useState<string>()

  const loadGame = (files: File[]) => {
    try {
      const project = buildGameProject(files)
      const environment = buildEnvironment(project.sources)
      const interpreter = interpret(environment, WRENatives)
      interpreter.exec(getProgramIn(project.main, environment))
      setGame(project)
      setEvaluation(interpreter.evaluation)
    }
    catch(exception){
      if(exception instanceof Error){
        setError(exception.message)
      }
    }
  }

  const title = evaluation ? evaluation.object('wollok.game.game')?.get('title')?.innerValue : ''

  if(error){
    return <div className={$.container} style={{display: 'flex', justifyContent: 'center',alignItems: 'center'}}>
              <WollokLogo />
              <h1 style = {{fontSize: '3em'}}>{error}</h1>
              <p style = {{fontSize: '1.5em'}}>No se encontro un programa, cuya extension es .wpgm, dentro del proyecto.
                 Podes crear uno dentro de la carpeta src para poder correr el juego.
              </p>
           </div>
  }
  if(!evaluation || !game)
    return <FilesSelector onFilesLoad={loadGame} />
    
  return <div className={$.container}>
            <h1>{title}</h1>
            <div>
              <Sketch gameProject={game} evaluation={evaluation} />
              <ReactMarkdown source={game.description} className={$.description} />
            </div>
          </div>



  // return !evaluation || !game
  //   ? <FilesSelector onFilesLoad={loadGame} />
  //   : <div className={$.container}>
  //     <h1>{title}</h1>
  //     <div>
  //       <Sketch gameProject={game} evaluation={evaluation} />
  //       <ReactMarkdown source={game.description} className={$.description} />
  //     </div>
  //   </div>
}

export default memo(Game)