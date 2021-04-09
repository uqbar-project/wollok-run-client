import React, { useContext, useEffect } from 'react'
import Editor from '../worksheet/Editor'
import { DebuggerContext } from './Debugger'
import $ from './SourceDisplay.module.scss'

export type Props = {
  fileName: string
}

const SourceDisplay = ({fileName}: Props) => {
  const { executionDirector, files } = useContext(DebuggerContext)
  const currentNode = executionDirector.evaluation.currentNode
  const currentFileName = currentNode.source?.file
  const code = files.find(({ name }) => name === fileName)?.content ?? `Source not available: ${currentFileName}`
  const highlight = (code: string) => currentNode.source
    ? `${code.slice(0, currentNode.source.start.offset)}<b id='current'>${code.slice(currentNode.source.start.offset, currentNode.source.end.offset)}</b>${code.slice(currentNode.source.end.offset)}`
    : code

  useEffect(() => {
    document.getElementById('current')?.scrollIntoView()
  }, [currentNode])

  return (
    <Editor code={code} className={$.editor} customHighlight={currentFileName === fileName ? highlight : undefined} />
  )
}

export default SourceDisplay