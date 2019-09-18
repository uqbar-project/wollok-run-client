import { navigate, RouteComponentProps } from '@reach/router'
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'
import { parse } from 'query-string'
import Tooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import React, { memo, useEffect, useState } from 'react'
import { IoIosCheckmarkCircle as OKIcon, IoIosCloseCircle as ErrorIcon } from 'react-icons/io'
import SplitterLayout from 'react-splitter-layout'
import 'react-splitter-layout/lib/index.css'
import { buildEnvironment, Environment, Evaluation } from 'wollok-ts/dist/src'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


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
    navigate(`${location!.pathname}?code=${compressToEncodedURIComponent(code)}`, { replace: true })
    setEditorCode(code)
    if (code.trim() !== editorCode.trim()) updateEnvironment(code)
  }

  return (
    <div className={$.worksheet}>
      <SplitterLayout vertical percentage customClassName={$.workspace} secondaryInitialSize={20} >
        <SplitterLayout percentage>
          <Editor code={editorCode} onCodeChange={onEditorCodeChange} />
          <ObjectDiagram evaluation={evaluation} />
        </SplitterLayout>
        <Repl onEvaluationChange={setEvaluation} environment={environment} />
      </SplitterLayout>
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