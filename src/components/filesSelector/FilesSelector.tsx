import React from 'react'
import { RouteComponentProps } from '@reach/router'
import GitSelector from './GitSelector'
import LocalSelector from './LocalSelector'

export type File = {
  name: string
  content: Buffer
}

export type FilesCallback = (files: File[]) => void

type FilesSelectorProps = RouteComponentProps & {cb: FilesCallback}
const FilesSelector = (props: FilesSelectorProps) => {
  return <div>
    <GitSelector {...props}/>
    <LocalSelector {...props}/>
  </div>
}

export default FilesSelector