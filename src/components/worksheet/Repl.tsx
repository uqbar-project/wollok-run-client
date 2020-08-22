import React, { KeyboardEvent, memo, useState } from 'react'
import Slider from 'react-input-slider'
import SimpleCodeEditor from 'react-simple-code-editor'
import Splitter from 'react-splitter-layout'
import { build, Environment, Evaluation, fill, interpret, link, List, parse, Sentence } from 'wollok-ts/dist'
import { Natives, RuntimeObject, VOID_ID } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import $ from './Repl.module.scss'

const natives = wre as Natives

const CodeEditor = memo(SimpleCodeEditor)

type Output = {
  evaluation: Evaluation
  description: string
}

export type ReplProps = {
  environment?: Environment,
  onEvaluationChange: (evaluation: Evaluation) => void,
}

const Repl = ({ environment: baseEnvironment, onEvaluationChange }: ReplProps) => {
  const [code, setCode] = useState('')
  const [outputs, setOutputs] = useState<List<Output | undefined>>([])
  const [displayedOutput, setDisplayedOutput] = useState(0)

  const evaluate = () => {
    try {
      const allSentences = parse.Body.tryParse(`{${code.trim()}\n}`).sentences
      const lines = Math.max(...allSentences.map(sentence => sentence.source!.start.line))
      const sentencesByLine = allSentences.reduce((sentences, sentence) => {
        const line = sentence.source!.start.line
        if (!sentences[line]) sentences[line] = []
        sentences[line].push(sentence as Sentence)
        return sentences
      }, {} as { [line: number]: Sentence[] })

      const environmentsPerLine = Array.from({ length: lines }, (_, i) => {
        const lineSentences = sentencesByLine[i + 1]
        if (!lineSentences) return undefined


        const nextLineIndex = allSentences.findIndex(({ source }) => source!.start.line > i)
        const previousLinesSentences = allSentences.slice(0, nextLineIndex < 0 ? allSentences.length : nextLineIndex)
        const lineLastSentence = lineSentences[lineSentences.length - 1]
        const lineInitialSentences = lineSentences.slice(0, Math.max(lineSentences.length - 1, 0))

        const closureLiteral = build.Closure({
          sentences: [
            ...previousLinesSentences,
            ...lineInitialSentences,
            ...lineLastSentence.is('Expression') ? [build.Return(lineLastSentence)] :
              lineLastSentence.is('Assignment') ? [lineLastSentence, build.Return(lineLastSentence.variable)] :
                lineLastSentence.is('Variable') ? [lineLastSentence, build.Return(build.Reference(lineLastSentence.name))] :
                  [lineLastSentence]
          ]
        })

        const replModule = build.Singleton('repl', closureLiteral.value)()
        const mainPackage = build.Package('worksheet')(build.Package('main')(replModule))
        return link([fill(mainPackage)], baseEnvironment)
      })

      const newOutputs = environmentsPerLine.map(environment => {
        if (!environment) return undefined

        const { buildEvaluation, stepAll, sendMessage } = interpret(environment, natives)
        const evaluation = buildEvaluation()
        stepAll(evaluation)

        sendMessage('apply', environment.getNodeByFQN<'Singleton'>('worksheet.main.repl').id)(evaluation)
        const response = evaluation.currentFrame()!.popOperand()

        let description: string
        if (response !== VOID_ID) {
          sendMessage('toString', response)(evaluation)
          const wDescription: RuntimeObject = evaluation.instance(evaluation.currentFrame()!.popOperand())
          wDescription.assertIsString()
          description = wDescription.innerValue
        } else description = response

        return { description, evaluation }
      })

      setOutputs(newOutputs)
      setDisplayedOutput(newOutputs.length)
      const lastOutput = [...newOutputs].reverse().find(output => !!output)
      if (lastOutput) onEvaluationChange(lastOutput.evaluation)

    } catch (error) {
      const codeWithoutOutput = code.trim().split('\n').filter(line => !line.startsWith('//>')).join('\n')
      const formattedOutput = `${error.stack}`.split('\n').map(line => `//> ${line}`).join('\n')
      setCode(`${codeWithoutOutput}\n${formattedOutput}\n`)
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      evaluate()
    }
  }

  return (
    <div className={$.repl}>
      <Splitter percentage>
        <div className={$.rplContainer}>
          <Slider
            style={{ maxHeight: `${outputs.length}em` }}
            className={$.slider}
            axis='y'
            y={displayedOutput}
            ymin={1}
            ymax={outputs.length}
            onChange={({ y: nextDisplayedOutput }: any) => {
              setDisplayedOutput(nextDisplayedOutput)

              if (displayedOutput !== nextDisplayedOutput && outputs[nextDisplayedOutput - 1]) {
                onEvaluationChange(outputs[nextDisplayedOutput - 1]!.evaluation)
              }
            }}
          />
          <CodeEditor
            className={$.editor}
            value={code}
            onValueChange={setCode}
            onKeyDown={onKeyDown}
            placeholder='Write expressions to evaluate here (ctrl+Enter)'
            highlight={text => text}
            padding={4}
          />
          <button onClick={evaluate}>RUN</button>
        </div>
        <CodeEditor
          className={$.editor}
          value={outputs.map(output => output ? output.description : '').join('\n')}
          readOnly
          onValueChange={() => { }}
          highlight={text => text}
          padding={4}
        />
      </Splitter>
    </div>
  )
}

export default memo(Repl)