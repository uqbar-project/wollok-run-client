import React from 'react'
import $ from './App.module.scss'
import Game from './Game'

const App = () => {

  // const files: File[] = [
  //   { name: 'src/foo.wlk', content: 'lalalala codigo' },
  //   { name: 'src/bar.wlk', content: 'lalalala otro codigo' },
  //   { name: 'src/baz.wlk', content: 'lalalala otro codigo más' },
  // ]

  // const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // return (
  //   <div className={styles.app}>
  //     <SourceView files={files} setSelectedFile={setSelectedFile} selectedFile={selectedFile} />
  //   </div>
  // )

  return (
    <div className={$.app}>
      <Game />
    </div>
  )
}

export default App
