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
import Parsimmon from 'parsimmon'

export interface ValidationErrorProps {
  problems: List<Problem>
  callback: () => void
}

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

export function ValidationError({ problems, callback }: ValidationErrorProps) {
  const button = {
    children: (
      <Button style={{ float: 'right' }} startIcon={<PublishIcon />} onClick={ callback } variant="contained" color="primary">
      Cargar Juego
      </Button>
    ),
  }

  return (
    <BaseErrorScreen description = 'Se encontraron algunos problemas que pueden impedir que el juego se ejecute con normalidad. ¿Desea correrlo de todos modos?'
      bottom = { button }>
      <br />
      <textarea
        className={$.errorMessage}
        readOnly
        value= { 'Hubo problemas de validacion: \n' + validationMessage(problems)} //TODO: USE PROBLEMS TO CREATE A BETTER MESSAGE
      />
    </BaseErrorScreen>
  )
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

function validationMessage(problems: List<Problem>) {
  return problems.map(problem => problemMessage(problem)).join('\n')
}

function problemMessage(problem: Problem) {
  return `Problem code: ${problem.code} in file ${humanizeFile(problem)}. Starting ${problemLocation(problem, sourceMapStart)} and ending ${problemLocation(problem, sourceMapEnd)}.`
}

function problemLocation(problem: Problem, location: (problem: Problem) => Parsimmon.Index | undefined) {
  return `in line ${humanizedLocation(location(problem)?.line)} on column ${humanizedLocation(location(problem)?.column)}`
}

function humanizeFile(problem: Problem) {
  return problem.node.sourceFileName() || 'unknown'
}

function humanizedLocation(num: number | undefined){
  return num ? num : 'unknown'
}

function sourceMapStart(problem: Problem) {
  return problem.source?.start
}

function sourceMapEnd(problem: Problem) {
  return problem.source?.end
}