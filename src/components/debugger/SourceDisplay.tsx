import React, { useContext, useEffect } from 'react'
import Editor from '../worksheet/Editor'
import { DebuggerContext } from './Debugger'
import $ from './SourceDisplay.module.scss'

const SourceDisplay = () => {
  const { debuggedNode, files } = useContext(DebuggerContext)
  const code = files.find(({ name }) => name === debuggedNode.source?.file)?.content ?? 'Source not available'
  const highlight = (code: string) => debuggedNode.source
    ? `${code.slice(0, debuggedNode.source.start.offset)}<b id='current'>${code.slice(debuggedNode.source.start.offset, debuggedNode.source.end.offset)}</b>${code.slice(debuggedNode.source.end.offset)}`
    : code

  useEffect(() => {
    document.getElementById('current')?.scrollIntoView()
  }, [debuggedNode])

  return <Editor code={code} className={$.editor} customHighlight={highlight} />
}

export default SourceDisplay