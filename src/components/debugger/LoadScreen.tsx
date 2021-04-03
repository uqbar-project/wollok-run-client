import React, { memo, useState, Dispatch } from 'react'
import { buildEnvironment, is, Id as IdType, Name, List, Test } from 'wollok-ts'
import { FiPlayCircle as RunIcon } from 'react-icons/fi'
import $ from './LoadScreen.module.scss'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import { DebuggerState } from './Debugger'


export type LoadScreenProps = {
  setDebuggerState: Dispatch<DebuggerState>
}

const LoadScreen = ({ setDebuggerState }: LoadScreenProps) => {

  const [files, setFiles] = useState<List<{name: Name, content: string}>>([])

  const onFilesLoad = async (files: File[]) => setFiles(
    files
      .filter(file => file.name.match(/\.(?:wlk|wtest|wpgm)$/))
      .map(({ name, content }) => ({ name, content: content.toString('utf8') }))
  )

  const environment = buildEnvironment(files)
  const tests = environment?.descendants()?.filter(is('Test'))

  const onTestSelected = (testId: IdType) => () => setDebuggerState({
    environment,
    debuggedNode: environment.getNodeById<Test>(testId),
    files,
  })

  return (
    !tests.length
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