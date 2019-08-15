import React from 'react'
import $ from './SourceView.module.scss'

export type File = {
  name: string,
  content: string,
}
export type Props = {
  files: File[],
  selectedFile: File | null,
  setSelectedFile: (file: File | null) => void
}

export default ({ files, selectedFile, setSelectedFile }: Props) => {

  return (
    <div className={$.root}>
      <div className={$.navigationPanel}>
        <ul>{
          files.map(file =>
            <li
              key={file.name}
              className={selectedFile && selectedFile.name === file.name ? $.selected : undefined}
              onClick={() => setSelectedFile(file)}
            >
              {file.name}
            </li>
          )}</ul>
      </div>
      <div className={$.editor}>
        {selectedFile && selectedFile.content}
      </div>
    </div>
  )
}