import React, { ChangeEvent } from 'react'
import { FilesCallback, File, FilesSelectorProps } from './FilesSelector'
import $ from './FilesSelector.module.scss'

const loadLocalFiles = (cb: FilesCallback) => async (event: ChangeEvent<HTMLInputElement>) => {
  const files = await Promise.all([...event.target.files!]
    // .filter(file => file.name.match(/\.(?:wlk|wtest|wpgm)$/))
    .map(file => new Promise<File>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        name: file.webkitRelativePath,
        content: new Buffer(reader.result as ArrayBuffer),
      })
      reader.readAsArrayBuffer(file)
    }))
  )
  cb(files)
}

const LocalSelector = (props: FilesSelectorProps) => {
  return <div className={$.selector}>
    <label>Cargá un proyecto Wollok desde tu máquina</label>
    <input type='file' webkitdirectory='' multiple onChange={loadLocalFiles(props.cb)} />
  </div>
}

export default LocalSelector