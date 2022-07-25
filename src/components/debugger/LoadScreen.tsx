import React, { memo, useState } from 'react'
import { buildEnvironment, is, Test, Environment } from 'wollok-ts'
import { FiPlayCircle as RunIcon } from 'react-icons/fi'
import $ from './LoadScreen.module.scss'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import { SourceFile } from './Debugger'
import { List } from 'wollok-ts/dist/extensions'

export type LoadScreenProps = {
  onTestSelected(files: List<SourceFile>, environment: Environment, test: Test): void
}

const LoadScreen = ({ onTestSelected }: LoadScreenProps) => {

  const [files, setFiles] = useState<List<SourceFile>>([])

  const onFilesLoad = async (files: File[]) => setFiles(
    files
      .filter(file => file.name.match(/\.(?:wlk|wtest|wpgm)$/))
      .map(({ name, content }) => ({ name, content: content.toString('utf8') }))
  )

  const onTestClick = (test: Test) => () => onTestSelected(files, environment, test)

  const environment = buildEnvironment(files)
  const tests = environment?.descendants()?.filter(is('Test'))

  return (
    !tests.length
      ? <FilesSelector onFilesLoad={onFilesLoad} />
      : (
        <div className={$.container}>
          {tests.length} tests found:
          <ul>
            {tests?.map(test => (
              <li key={test.id}><RunIcon onClick={onTestClick(test)} />{test.name}</li>
            ))}
          </ul>
        </div>
      )
  )
}

export default memo(LoadScreen)