import React, { KeyboardEvent, useState } from 'react'
import CodeEditor from 'react-simple-code-editor'
import SplitterLayout from 'react-splitter-layout'
import 'react-splitter-layout/lib/index.css'
import $ from './App.module.scss'

type EditorProps = {
  code: string,
  onCodeChange: (code: string) => void,
}
const Editor = ({ code, onCodeChange }: EditorProps) => {
  return (
    <CodeEditor
      value={code}
      onValueChange={onCodeChange}
      placeholder='Write your Wollok object definitions here'
      highlight={text => text}
      padding={4}
      style={{ minHeight: 500 }}
    />
  )
}


type ReplProps = {
  code: string,
  onCodeChange: (code: string) => void,
}
const Repl = ({ code, onCodeChange }: ReplProps) => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      alert(`Execute: "${code}"`)
      onCodeChange('')
    }
  }

  return (
    <CodeEditor
      className={$.repl}
      value={code}
      onValueChange={onCodeChange}
      onKeyDown={onKeyDown}
      placeholder='Write expressions to evaluate here (ctrl+Enter)'
      highlight={text => text}
      padding={4}
      style={{ minHeight: 200 }}
    />
  )
}


const App = () => {

  const [editorCode, setEditorCode] = useState(localStorage.getItem('editor-code')!)
  const onEditorCodeChange = (code: string) => {
    localStorage.setItem('editor-code', code)
    setEditorCode(code)
  }

  const [replCode, setReplCode] = useState('')

  return (
    <div className={$.app}>
      <SplitterLayout vertical percentage customClassName={$.workspace} secondaryInitialSize={20} >
        <SplitterLayout percentage>
          <Editor code={editorCode} onCodeChange={onEditorCodeChange} />
          <div>DIAGRAM ZONE</div>
        </SplitterLayout>

        <Repl code={replCode} onCodeChange={setReplCode} />
      </SplitterLayout>
      <div className={$.statusBar}>Status: OK</div>
    </div>
  )
}

export default App
