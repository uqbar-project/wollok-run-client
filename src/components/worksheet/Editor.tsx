import React, { memo } from 'react'
import SimpleCodeEditor from 'react-simple-code-editor'

const CodeEditor = memo(SimpleCodeEditor)

export type EditorProps = {
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
      style={{ minHeight: '100%' }}
    />
  )
}

export default memo(Editor)