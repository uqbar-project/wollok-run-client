import React, { ReactNode, useState } from 'react'
import GitSelector from './GitSelector'
import LocalSelector from './LocalSelector'
import Spinner from '../Spinner'
import $ from './FilesSelector.module.scss'
import { WollokLogo } from '../Home/Home'
import { BaseErrorScreen } from '../ErrorScreen'
import { Parent } from '../utils'
import { Link } from '@reach/router'

export type File = {
  name: string
  content: Buffer
}

export type FilesCallback = (files: File[]) => void

export type SelectorProps = FilesSelectorProps & { onStartLoad: () => void }

export interface LoadingError {
  title: string
  description: string
  children: ReactNode
}

type FilesSelectorProps = { onFilesLoad: FilesCallback }
const FilesSelector = ({ children, ...props }: FilesSelectorProps & Parent) => {
  const [loadingError, setloadingError] = useState<LoadingError>()
  const [loading, setLoading] = useState<boolean>(false)
  const onStartLoad = () => setLoading(true)
  const onFailureDo = (error: LoadingError) => setloadingError(error)

  if (loadingError)
    return (
      <BaseErrorScreen title = {loadingError.title} description = {loadingError.description}>
        {loadingError.children}
      </BaseErrorScreen>
    )

  return loading
    ? <Spinner />
    : <div className={$.container}>
      <Link to={'/'}>
        <WollokLogo />
      </Link>
      <div>
        <GitSelector {...props} onStartLoad={onStartLoad} onFailureDo={onFailureDo}/>
        <LocalSelector {...props} onStartLoad={onStartLoad} />
      </div>
      <div className={$.breaker} />
      {children}
    </div>
}

export default FilesSelector