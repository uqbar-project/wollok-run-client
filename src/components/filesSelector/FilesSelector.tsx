import React, { ReactNode, useState } from 'react'
import GitSelector from './GitSelector'
import LocalSelector from './LocalSelector'
import Spinner from '../Spinner'
import $ from './FilesSelector.module.scss'
import { WollokLogo } from '../Home/Home'
import { BackArrow } from '../BackArrow'
import { BaseErrorScreen } from '../ErrorScreen'
import { Parent } from '../utils'
import { RouteComponentProps } from '@reach/router'
import FeaturedGames from '../game/FeaturedGames'

export type File = {
  name: string
  content: Buffer
}

export type FilesCallback = (files: File[]) => void

export type SelectorProps = { onStartLoad: () => void }

export interface LoadingError {
  title: string
  description: string
  children: ReactNode
}

export type LoadFilesType = SelectorProps & {
  onFilesLoad: FilesCallback
}


type FilesSelectorProps = RouteComponentProps
const FilesSelector = ( _: FilesSelectorProps & Parent) => {
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
      <div><BackArrow returnPath='/' /></div>
      <WollokLogo />
      <div>
        <GitSelector onStartLoad={onStartLoad} onFailureDo={onFailureDo}/>
        <LocalSelector onStartLoad={onStartLoad} />
      </div>
      <div className={$.breaker} />
      <FeaturedGames />
    </div>
}

export default FilesSelector