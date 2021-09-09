import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, WRENatives } from 'wollok-ts'
import interpret from 'wollok-ts/dist/interpreter/interpreter'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { GameProject, buildGameProject, getProgramIn, TooManyProgramsException } from './gameProject'
import { BackArrow } from '../BackArrow'
import { Button, FormControl, NativeSelect } from '@material-ui/core'
import PublishIcon from '@material-ui/icons/Publish'
import { ErrorScreen } from '../ErrorScreen'

export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [error, setError] = useState<Error>()

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
    catch(exception){
      if(exception instanceof Error){
        setError(exception)
      }
    }
  }

  const title = evaluation ? evaluation.object('wollok.game.game')?.get('title')?.innerValue : ''

  if(error){
    return cantLoadProgramView()
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

  function cantLoadProgramView() {
    if(error instanceof TooManyProgramsException){
      let program: string
      return <ErrorScreen>
          <p>Se encontraron varios programas en el proyecto.
          Seleccione uno para continuar:
          </p>
          <div>
            <FormControl className = {$.wpgmPicker}>
              <NativeSelect defaultValue = "" style={{ padding: '0.75%' }} onChange={(e) => program = e.target.value}>
                <option value="" disabled>Seleccione el programa para correr el juego</option>
                {error.wpgmFiles.map((file, i) => <option key={i} value={file.name}>{file.name}</option>)}
              </NativeSelect>
            </FormControl>
            <div style={{ paddingTop: '2%' }}>
              <BackArrow returnPath='/' />
              <Button style={{ float: 'right' }} startIcon={<PublishIcon />} onClick={() => reloadGame(error.files, program)} variant="contained" color="primary">Cargar Juego</Button>
            </div>
          </div>
        </ErrorScreen>
    }

    return <ErrorScreen>
      <p style={{ marginTop: '5px', marginBottom: '5px' }}>
        No se encontró un programa dentro del proyecto. 
        Podes crear uno con la extensión .wpgm dentro de la carpeta src para poder correr el juego.
      </p>
      <div style={{ paddingTop: '2%' }}>
      <BackArrow returnPath='/' />
      </div>
    </ErrorScreen>
  }
}

export default memo(Game)