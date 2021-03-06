import React, { useState } from 'react'
import GitSelector from './GitSelector'
import LocalSelector from './LocalSelector'
import Spinner from '../Spinner'
import $ from './FilesSelector.module.scss'
import { WollokLogo } from '../Home/Home'
import { BackArrow } from '../BackArrow'

export type File = {
  name: string
  content: Buffer
}

export type FilesCallback = (files: File[]) => void

export type SelectorProps = FilesSelectorProps & { onStartLoad: () => void }


type FilesSelectorProps = { onFilesLoad: FilesCallback }
const FilesSelector = (props: FilesSelectorProps) => {
  const [loading, setLoading] = useState<boolean>(false)
  const onStartLoad = () => setLoading(true)

  return loading
    ? <Spinner />
    : <div className={$.container}>
      <div><BackArrow returnPath='/' /></div>
      <WollokLogo />
      <div>
        <GitSelector {...props} onStartLoad={onStartLoad} />
        <LocalSelector {...props} onStartLoad={onStartLoad} />
      </div>
    </div>
}

export default FilesSelector