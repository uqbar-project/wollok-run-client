import React, { memo, useState, Dispatch } from 'react'
import { buildEnvironment, is, Id as IdType } from 'wollok-ts'
import { Environment } from 'wollok-ts/dist'
import { FiPlayCircle as RunIcon } from 'react-icons/fi'
import $ from './LoadScreen.module.scss'
import FilesSelector, { File } from '../filesSelector/FilesSelector'


export type DebugTarget = { environment: Environment, testId: IdType }

export type LoadScreenProps = {
  setDebugTarget: Dispatch<DebugTarget>
}

const LoadScreen = ({ setDebugTarget }: LoadScreenProps) => {

  const [environment, setEnvironment] = useState<Environment | undefined>(undefined)

  const tests = environment?.descendants()?.filter(is('Test'))

  const onFilesLoad = async (files: File[]) => {
    const wollokFiles = files
      .filter(file => file.name.match(/\.(?:wlk|wtest|wpgm)$/))
      .map(({ name, content }) => ({ name, content: content.toString('utf8') }))
    setEnvironment(buildEnvironment(wollokFiles))
  }

  const onTestSelected = (testId: IdType) => () => environment && setDebugTarget({ environment, testId })


  return (
    !tests
      ? <FilesSelector onFilesLoad={onFilesLoad} />
      : (
        <div className={$.container}>
          {tests.length} tests found:
          <ul>
            {tests?.map(test => (
              <li key={test.id}><RunIcon onClick={onTestSelected(test.id)} />{test.name}</li>
            ))}
          </ul>
        </div>
      )
  )
}

export default memo(LoadScreen)