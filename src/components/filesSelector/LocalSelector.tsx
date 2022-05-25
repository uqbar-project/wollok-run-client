import React, { ChangeEvent, useContext } from 'react'
import { GameContext } from '../../context/GameContext'
import { File, LoadFilesType, SelectorProps } from './FilesSelector'
import $ from './FilesSelector.module.scss'

const loadLocalFiles = ({ onFilesLoad, onStartLoad }: LoadFilesType) => async (event: ChangeEvent<HTMLInputElement>) => {
  onStartLoad()
  const files = await Promise.all([...event.target.files!]
    // .filter(file => file.name.match(/\.(?:wlk|wtest|wpgm)$/))
    .map(file => new Promise<File>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        name: (file as any).webkitRelativePath,
        content: new Buffer(reader.result as ArrayBuffer),
      })
      reader.readAsArrayBuffer(file)
    }))
  )
  onFilesLoad(files)
}

const LocalSelector = (props: SelectorProps) => {
  const { loadGame } = useContext(GameContext)
  
  return <div className={$.selector}>
    <label>Cargá un proyecto Wollok desde tu máquina (° ͜ʖ °)</label>
    <input className={$.loadButton} type='file' {...{ webkitdirectory:'' }} multiple onChange={loadLocalFiles({...props, onFilesLoad: loadGame})} />
  </div>
}

export default LocalSelector