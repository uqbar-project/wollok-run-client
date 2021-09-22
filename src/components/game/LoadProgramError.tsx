import React from 'react'
import { Button, FormControl, NativeSelect } from '@material-ui/core'
import PublishIcon from '@material-ui/icons/Publish'
import { File } from '../filesSelector/FilesSelector'
import { MultiProgramException, NoProgramException } from './gameProject'
import { BackArrow } from '../BackArrow'
import { ErrorScreen } from '../ErrorScreen'
import $ from './Game.module.scss'

export interface LoadErrorProps {
  error: Error
  reload: (files: File[], program: string) => void
}

export interface GenericErrorProps {
  error: Error
}

export function LoadError(props: LoadErrorProps) {

  const error = props.error

  if(error instanceof MultiProgramException)
    return <MultiProgramError {...props} />

  if(error instanceof NoProgramException)
    return <NoProgramError />

  return <GenericError { ... { error } }/>
}

function MultiProgramError({ error: e, reload }: LoadErrorProps) {
  const error = e as MultiProgramException
  let program: string // TODO: Tenerlo en la URL?
  return <ErrorScreen>
    <p>Se encontraron varios programas en el proyecto.
    Seleccione uno para continuar:
    </p>
    <div>
      <FormControl className={$.wpgmPicker}>
        <NativeSelect defaultValue="" style={{ padding: '0.75%' }} onChange={(e) => program = e.target.value}>
          <option value="" disabled>Seleccione el programa para correr el juego</option>
          {error.wpgmFiles.map((file, i) => <option key={i} value={file.name}>{file.name}</option>)}
        </NativeSelect>
      </FormControl>
      <div style={{ paddingTop: '2%' }}>
        <BackArrow returnPath='/' />
        <Button style={{ float: 'right' }} startIcon={<PublishIcon />} onClick={() => reload(error.files, program)} variant="contained" color="primary">
          Cargar Juego
        </Button>
      </div>
    </div>
  </ErrorScreen>
}

function NoProgramError() {
  return <ErrorScreen>
    <p style={{ marginTop: '5px', marginBottom: '5px' }}>
      No se encontró un programa dentro del proyecto.
      Podés crear uno con la extensión .wpgm dentro de la carpeta src para poder correr el juego.
    </p>
    <div style={{ paddingTop: '2%' }}>
      <BackArrow returnPath='/' />
    </div>
  </ErrorScreen>
}

function GenericError({ error }: GenericErrorProps) {
  return <ErrorScreen>
    <p style={{ marginTop: '5px', marginBottom: '5px' }}>
      Lo sentimos, ocurrió un error y no se pudo cargar el juego.
    </p>
    <br />
    <textarea
      className={$.errorMessage}
      readOnly
      value={error.message}
    />
    <div style={{ paddingTop: '2%' }}>
      <BackArrow returnPath='/' />
    </div>
  </ErrorScreen>
}