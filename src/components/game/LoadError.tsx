import React from 'react'
import { File } from '../filesSelector/FilesSelector'
import { MultiProgramException, NoProgramException } from './gameProject'
import { BaseErrorScreen } from '../ErrorScreen'
import $ from './Game.module.scss'
import { ProgramSelector } from '../ProgramSelector'

export interface LoadErrorProps<T extends Error> {
  error: T
  reload: (files: File[], program: string) => void
}

export interface GenericErrorProps {
  error: Error
}

export function LoadError<T extends Error>(props: LoadErrorProps<T>) {

  const error = props.error

  if(error instanceof MultiProgramException)
    return <ProgramSelector error = { error } reload = { props.reload } />

  if(error instanceof NoProgramException)
    return <NoProgramError />

  return <GenericError { ... { error } }/>
}

function NoProgramError() {
  return <BaseErrorScreen description = 'No se encontró un programa dentro del proyecto. Podés crear uno con la extensión .wpgm dentro de la carpeta src para poder correr el juego.' />
}

function GenericError({ error }: GenericErrorProps) {
  return (
    <BaseErrorScreen description = 'Lo sentimos, ocurrió un error y no se pudo cargar el juego.'>
      <br />
      <textarea
        className={$.errorMessage}
        readOnly
        value={error.message}
      />
    </BaseErrorScreen>
  )
}