import React from 'react'
import { Button, FormControl, NativeSelect } from '@material-ui/core'
import PublishIcon from '@material-ui/icons/Publish'
import { File } from '../filesSelector/FilesSelector'
import { TooManyProgramsException } from './gameProject'
import { BackArrow } from '../BackArrow'
import { ErrorScreen } from '../ErrorScreen'
import $ from './Game.module.scss'

export interface LoadProgramErrorProps {
  error: Error
  reload: (files: File[], program: string) => void
}
export function LoadProgramError(props: LoadProgramErrorProps) {
  return props.error instanceof TooManyProgramsException
    ? <MultiProgramError {...props} />
    : <NoProgramError />
}

function MultiProgramError({ error: e, reload }: LoadProgramErrorProps) {
  const error = e as TooManyProgramsException
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
      Podes crear uno con la extensión .wpgm dentro de la carpeta src para poder correr el juego.
    </p>
    <div style={{ paddingTop: '2%' }}>
      <BackArrow returnPath='/' />
    </div>
  </ErrorScreen>
}