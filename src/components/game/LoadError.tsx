import React from 'react'
import { File } from '../filesSelector/FilesSelector'
import { MultiProgramException, NoProgramException } from './gameProject'
import { BaseErrorScreen } from '../ErrorScreen'
import $ from './Game.module.scss'
import { ProgramSelector } from '../ProgramSelector'
import { List } from 'wollok-ts'
import { Problem } from 'wollok-ts/dist/validator'
import { Button } from '@material-ui/core'
import PublishIcon from '@material-ui/icons/Publish'

export interface ValidationErrorProps {
  problems: List<Problem>
  callback: () => void
}

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

export function ValidationError({ problems, callback }: ValidationErrorProps) {
  const props = {
    description: 'Se encontraron algunos problemas que pueden impedir que el juego se ejecute con normalidad. ¿Desea correrlo de todos modos?',
    children: (
      <>
        <br />
        <textarea
          className={$.errorMessage}
          readOnly
          value='Hubieron problemas de validacion' //TODO: USE PROBLEMS TO CREATE A BETTER MESSAGE
        />
      </>
    ),
    bottom: {
      children: (
        <Button style={{ float: 'right' }} startIcon={<PublishIcon />} onClick={() => callback() } variant="contained" color="primary">
          Cargar Juego
        </Button>
      ),
    },
  }

  return <BaseErrorScreen { ... props } />
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