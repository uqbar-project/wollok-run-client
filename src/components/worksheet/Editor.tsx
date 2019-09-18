import React from 'react'
import CodeEditor from 'react-simple-code-editor'
import 'react-splitter-layout/lib/index.css'

export type EditorProps = {
  code: string,
  onCodeChange: (code: string) => void,
}

export default ({ code, onCodeChange }: EditorProps) => {
  return (
    <CodeEditor
      value={code}
      onValueChange={onCodeChange}
      placeholder='Write your Wollok object definitions here'
      highlight={text => text}
      padding={4}
      style={{ minHeight: '100vh' }}
    />
  )
}
