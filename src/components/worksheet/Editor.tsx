import React, { memo, MouseEventHandler } from 'react'
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


export type EditorProps = {
  code: string
  onCodeChange?: (code: string) => void
  customHighlight?: (code: string) => string
  className?: string
  onContextMenu?: MouseEventHandler<HTMLDivElement>
}

const Editor = ({ code, onCodeChange, customHighlight = code => code, className, onContextMenu }: EditorProps) => {
  const ignoreChanges = () => {}

  const highlight = (text: string) => [...KEYWORDS, ...VALUES, ...COMMENTS].reduce((current, { regex, style }) =>
    current.replace(regex, `<span class='${style}'>$1</span>`)
  , customHighlight(text))


  return (
    <CodeEditor
      className={`${$.editor} ${className ?? ''}`}
      value={code}
      onValueChange={onCodeChange ?? ignoreChanges}
      placeholder='Write your Wollok object definitions here'
      highlight={highlight}
      padding={4}
      readOnly={!onCodeChange}
      style={{ minHeight: '100%' }}
      onContextMenu={onContextMenu}
    />
  )
}

export default memo(Editor)