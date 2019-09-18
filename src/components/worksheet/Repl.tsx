import React, { KeyboardEvent, useState } from 'react'
import CodeEditor from 'react-simple-code-editor'
import 'react-splitter-layout/lib/index.css'
import { build, Environment, Evaluation, fill, interpret, link, parse, Raw, Singleton } from 'wollok-ts/dist/src'
import { VOID_ID } from 'wollok-ts/dist/src/interpreter'
import natives from 'wollok-ts/dist/src/wre/wre.natives'
import $ from './Repl.module.scss'


export type ReplProps = {
  environment?: Environment,
  onEvaluationChange: (evaluation: Evaluation) => void,
}

export default ({ environment, onEvaluationChange }: ReplProps) => {
  const [code, setCode] = useState('')

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      let output: string
      try {
        const closureLiteral = parse.literal.tryParse(`{${code}}`)
        const replModule = build.Singleton('repl', closureLiteral.value as Singleton<Raw>)()
        const mainPackage = build.Package('main')(replModule)
        const replEnvironment = link([fill(mainPackage)], environment)
        const { buildEvaluation, stepAll, sendMessage } = interpret(replEnvironment, natives)
        const evaluation = buildEvaluation()

        stepAll(evaluation)
        sendMessage('apply', evaluation.environment.getNodeByFQN('main.repl').id)(evaluation)
        const response = evaluation.currentFrame().popOperand()

        if (response !== VOID_ID) {
          sendMessage('toString', response)(evaluation)
          output = evaluation.instance(evaluation.currentFrame().popOperand()).innerValue
        } else output = response

        onEvaluationChange(evaluation)
      } catch (error) {
        output = `ERROR: ${error.message}`
      }

      const codeWithoutOutput = code.trim().split('\n').filter(line => !line.startsWith('//>')).join('\n')
      const commentedOutput = output.split('\n').map(line => `//> ${line}`).join('\n')
      setCode(`${codeWithoutOutput}\n${commentedOutput}\n`)
    }
  }


  return (
    <CodeEditor
      className={$.repl}
      value={code}
      onValueChange={setCode}
      onKeyDown={onKeyDown}
      placeholder='Write expressions to evaluate here (ctrl+Enter)'
      highlight={text => text}
      padding={4}
      style={{ minHeight: '100vh' }}
    />
  )
}