import React, { useState } from 'react'
import GitSelector from './GitSelector'
import LocalSelector from './LocalSelector'
import Spinner from '../Spinner'
import $ from './FilesSelector.module.scss'

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
      <img src={'/wollok-logo.png'} width={280} height={90} alt={'wollok logo'} />
      <div>
        <GitSelector {...props} onStartLoad={onStartLoad} />
        <LocalSelector {...props} onStartLoad={onStartLoad} />
      </div>
    </div>
}

export default FilesSelector