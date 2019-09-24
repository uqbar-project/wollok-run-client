import React, { memo } from 'react'
import SimpleCodeEditor from 'react-simple-code-editor'
import $ from './Editor.module.scss'

const CodeEditor = memo(SimpleCodeEditor)


const KEYWORDS = [
  // tslint:disable-next-line:max-line-length
  /\b((?:class)|(?:object)|(?:import)|(?:package)|(?:program)|(?:property)|(?:test)|(?:mixed with)|(?:inherits)|(?:mixin)|(?:var)|(?:const)|(?:override)|(?:method)|(?:native)|(?:constructor)|(?:super)|(?:new)|(?:if)|(?:else)|(?:return)|(?:throw)|(?:try)|(?:then always)|(?:catch))\b/g,
].map(regex => ({ regex, style: $.keyword }))

const VALUES = [
  /\b((?:null)|(?:true)|(?:false))\b/g,
  /("[^\\"]+")/g,
  /(-?\d+(?:\.\d+)?)\b/g,
].map(regex => ({ regex, style: $.value }))

const COMMENTS = [
  /(\/\*(.|[\r\n])*?\*\/)/g,
  /(\/\/.*)/g,
].map(regex => ({ regex, style: $.comment }))

const highlight = (text: string) => [...KEYWORDS, ...VALUES, ...COMMENTS].reduce((current, { regex, style }) =>
  current.replace(regex, `<span class='${style}'>$1</span>`)
  , text)


export type EditorProps = {
  code: string,
  onCodeChange: (code: string) => void,
}

const Editor = ({ code, onCodeChange }: EditorProps) => {
  return (
    <CodeEditor
      className={$.editor}
      value={code}
      onValueChange={onCodeChange}
      placeholder='Write your Wollok object definitions here'
      highlight={highlight}
      padding={4}
      style={{ minHeight: '100%' }}
    />
  )
}

export default memo(Editor)