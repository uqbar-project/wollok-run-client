import React, { useContext, useEffect } from 'react'
import Editor from '../worksheet/Editor'
import { DebuggerContext } from './Debugger'
import $ from './SourceDisplay.module.scss'

export type Props = {
  fileName: string
}

const SourceDisplay = ({ fileName }: Props) => {
  const { executionDirector, files } = useContext(DebuggerContext)
  const currentNode = executionDirector.evaluation.currentNode
  const currentFileName = currentNode.sourceFileName()
  const code = files.find(({ name }) => name === fileName)?.content ?? `Source not available: ${currentFileName}`
  const highlight = (code: string) => currentNode.isSynthetic() ? code :
    `${code.slice(0, currentNode.sourceMap!.start.offset)}<b id='current'>${code.slice(currentNode.sourceMap!.start.offset, currentNode.sourceMap!.end.offset)}</b>${code.slice(currentNode.sourceMap!.end.offset)}`

  useEffect(() => {
    document.getElementById('current')?.scrollIntoView()
  }, [currentNode])

  return (
    <Editor code={code} className={$.editor} customHighlight={currentFileName === fileName ? highlight : undefined} />
  )
}

export default SourceDisplay