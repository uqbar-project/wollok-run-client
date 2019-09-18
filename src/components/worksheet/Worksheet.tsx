import React, { useEffect, useState } from 'react'
import { IoIosCheckmarkCircle as OKIcon, IoIosCloseCircle as ErrorIcon } from 'react-icons/io'
import SplitterLayout from 'react-splitter-layout'
import 'react-splitter-layout/lib/index.css'
import { buildEnvironment, Environment, Evaluation } from 'wollok-ts/dist/src'
import Editor from './Editor'
import ObjectDiagram from './ObjectDiagram'
import Repl from './Repl'
import $ from './Worksheet.module.scss'

export default () => {
  const [problem, setProblem] = useState<string>()
  const [environment, setEnvironment] = useState<Environment>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const [editorCode, setEditorCode] = useState(localStorage.getItem('editor-code') || '')

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


  useEffect(() => {
    updateEnvironment(editorCode)
  }, [])

  const onEditorCodeChange = (code: string) => {
    localStorage.setItem('editor-code', code)
    setEditorCode(code)
    if (code.trim() !== editorCode.trim()) updateEnvironment(code)
  }


  return (
    <div className={$.worksheet}>
      <SplitterLayout vertical percentage customClassName={$.workspace} secondaryInitialSize={20} >
        <SplitterLayout percentage>
          <Editor code={editorCode} onCodeChange={onEditorCodeChange} />
          {/* <div>{evaluation && JSON.stringify(evaluation.instances, undefined, 2)}</div> */}
          <ObjectDiagram evaluation={evaluation} />
        </SplitterLayout>
        <Repl onEvaluationChange={setEvaluation} environment={environment} />
      </SplitterLayout>
      <div className={`${$.statusBar} ${problem ? $.error : $.ok}`}>
        {problem
          ? <> <ErrorIcon /> {problem} </>
          : <> <OKIcon /> OK </>
        }

      </div>
    </div>
  )
}