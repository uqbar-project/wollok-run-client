import React, { ChangeEvent, memo, useState, Dispatch } from 'react'
import { buildEnvironment, is, Id as IdType } from 'wollok-ts'
import { Environment } from 'wollok-ts/dist'
import { FiPlayCircle as RunIcon } from 'react-icons/fi'
import $ from './LoadScreen.module.scss'


export type DebugTarget = { environment: Environment, testId: IdType }

export type LoadScreenProps = {
  setDebugTarget: Dispatch<DebugTarget>
}

const LoadScreen = ({ setDebugTarget }: LoadScreenProps) => {

  const [environment, setEnvironment] = useState<Environment|undefined>(undefined)

  const onFilesLoad = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = await Promise.all([...event.target.files!]
      .filter(file => file.name.match(/\.(?:wlk|wtest|wpgm)$/))
      .map(file => new Promise<{ name: string, content: string }>((resolve) => {
        const reader = new FileReader()  
        reader.onload = () => resolve({
          name: file.webkitRelativePath,
          content: reader.result as string,
        })
        reader.readAsText(file)
      }))
    )
    setEnvironment(buildEnvironment(files))
  }

  const onTestSelected = (testId: IdType) => () => environment && setDebugTarget({ environment, testId })

  return (
    <div className={$.container}>
      <input type='file' webkitdirectory='' multiple onChange={onFilesLoad}/>
      <ul>
        {environment?.descendants()?.filter(is('Test'))?.map(test => (
          <li key={test.id}><RunIcon onClick={onTestSelected(test.id)}/>{test.name}</li>
        ))}
      </ul>
    </div>
  )
}

export default memo(LoadScreen)