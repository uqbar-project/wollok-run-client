import React, { useState } from 'react'
import { RouteComponentProps } from '@reach/router'
import GitSelector from './GitSelector'
import LocalSelector from './LocalSelector'
import Spinner from '../Spinner';

export type File = {
  name: string
  content: Buffer
}

export type FilesCallback = (files: File[]) => void

export type FilesSelectorProps = RouteComponentProps & { cb: FilesCallback }
const FilesSelector = (props: FilesSelectorProps) => {
  const [loading, setLoading] = useState<boolean>(false)

  //TODO: Manejar asyncronismo
  const innerProps = { ...props, cb: (files: File[]) => { setLoading(true); props.cb(files) } }

  return loading
    ? <Spinner />
    : <div>
      <GitSelector {...innerProps} />
      <LocalSelector {...innerProps} />
    </div>
}

export default FilesSelector