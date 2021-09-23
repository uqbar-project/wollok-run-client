import React from 'react'
import { File } from '../filesSelector/FilesSelector'
import { MultiProgramException, NoProgramException } from './gameProject'
import { BaseErrorScreen } from '../ErrorScreen'
import $ from './Game.module.scss'
import { ProgramSelector } from '../ProgramSelector'

export interface LoadErrorProps {
  error: Error
  reload: (files: File[], program: string) => void
}

export interface MultiProgramErrorProps {
  error: MultiProgramException
  reload: (files: File[], program: string) => void
}

export interface GenericErrorProps {
  error: Error
}

export function LoadError(props: LoadErrorProps) {

  const error = props.error

  if(error instanceof MultiProgramException)
    return <ProgramSelector error = { error } reload = { props.reload } />

  if(error instanceof NoProgramException)
    return <NoProgramError />

  return <GenericError { ... { error } }/>
}

function NoProgramError() {
  const props = {
    description: 'No se encontró un programa dentro del proyecto. Podés crear uno con la extensión .wpgm dentro de la carpeta src para poder correr el juego.',
    children: null,
    bottom: { children: null },
  }

  return <BaseErrorScreen { ... props } />
}

function GenericError({ error }: GenericErrorProps) {
  const props = {
    description: 'Lo sentimos, ocurrió un error y no se pudo cargar el juego.',
    children: (
      <>
        <br />
        <textarea
          className={$.errorMessage}
          readOnly
          value={error.message}
        />
      </>
    ),
    bottom: { children: null },
  }

  return <BaseErrorScreen { ... props } />
}