import { navigate, RouteComponentProps } from '@reach/router'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { parse } from 'query-string'
import Tooltip from 'rc-tooltip'
import React, { memo, useEffect, useState } from 'react'
import { IoIosCheckmarkCircle as OKIcon, IoIosCloseCircle as ErrorIcon } from 'react-icons/io'
import Splitter from 'react-splitter-layout'
import { buildEnvironment, Environment, Evaluation } from 'wollok-ts/dist/src'
import useInterval from '../../hooks/useInterval'
import Editor from './Editor'
import ObjectDiagram from './ObjectDiagram'
import Repl from './Repl'
import $ from './Worksheet.module.scss'

export type WorksheetProps = RouteComponentProps

const Worksheet = ({ location }: WorksheetProps) => {
  const queryParameters: { code?: string } = parse(location!.search) as any

  const [problem, setProblem] = useState<string>()
  const [environment, setEnvironment] = useState<Environment>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [editorCode, setEditorCode] = useState<string>(queryParameters.code
    ? decompressFromEncodedURIComponent(queryParameters.code)
    : ''
  )

  useEffect(() => {
    updateEnvironment(editorCode)
  }, [])

  useInterval(() => {
    navigate(`${location!.pathname}?code=${compressToEncodedURIComponent(editorCode)}`, { replace: true })
  }, 2000)


  const updateEnvironment = (code: string) => {
    try {
      setEnvironment(buildEnvironment([{ name: 'main', content: code }]))
      setProblem(undefined)
    } catch (error) {
      setEnvironment(undefined)
      setProblem(`ERROR: ${error.message}`)
    }
    setEvaluation(undefined)
  }

  const onEditorCodeChange = (code: string) => {
    setEditorCode(code)
    updateEnvironment(code)
  }

  return (
    <div className={$.worksheet}>
      <Splitter vertical percentage customClassName={$.workspace} secondaryInitialSize={20} >
        <Splitter percentage>
          <Editor code={editorCode} onCodeChange={onEditorCodeChange} />
          <ObjectDiagram evaluation={evaluation} />
        </Splitter>
        <Repl onEvaluationChange={setEvaluation} environment={environment} />
      </Splitter>
      <div className={$.statusBar}>
        <Tooltip placement='topLeft' trigger={['hover']} overlay={problem || 'All is good :)'}>
          {problem
            ? <ErrorIcon className={$.error} />
            : <OKIcon className={$.ok} />
          }
        </Tooltip>
      </div>
    </div>
  )
}

export default memo(Worksheet)