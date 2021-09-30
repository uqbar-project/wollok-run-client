import React, { KeyboardEvent, memo, useState } from 'react'
import Slider from 'react-input-slider'
import SimpleCodeEditor from 'react-simple-code-editor'
import Splitter from 'react-splitter-layout'
import { WRENatives, Environment, Evaluation, link, List, parse, Sentence, RuntimeObject, Singleton, Method, Body, Return, Reference, Package } from 'wollok-ts'
import $ from './Repl.module.scss'


const CodeEditor = memo(SimpleCodeEditor)

type Output = {
  evaluation: Evaluation
  description: string
}

export type ReplProps = {
  environment?: Environment
  onEvaluationChange: (evaluation: Evaluation) => void
}

const Repl = ({ environment: baseEnvironment, onEvaluationChange }: ReplProps) => {
  const [code, setCode] = useState('')
  const [outputs, setOutputs] = useState<List<Output | undefined>>([])
  const [displayedOutput, setDisplayedOutput] = useState(0)

  const evaluate = () => {
    try {
      const allSentences = parse.Body.tryParse(`{${code.trim()}\n}`).sentences
      const lines = Math.max(...allSentences.map(sentence => sentence.sourceMap!.start.line))
      const sentencesByLine = allSentences.reduce((sentences, sentence) => {
        const line = sentence.sourceMap!.start.line
        if (!sentences[line]) sentences[line] = []
        sentences[line].push(sentence as Sentence)
        return sentences
      }, {} as { [line: number]: Sentence[] })

      const environmentsPerLine = Array.from({ length: lines }, (_, i) => {
        const lineSentences = sentencesByLine[i + 1]
        if (!lineSentences) return undefined


        const nextLineIndex = allSentences.findIndex(({ sourceMap }) => sourceMap!.start.line > i)
        const previousLinesSentences = allSentences.slice(0, nextLineIndex < 0 ? allSentences.length : nextLineIndex)
        const lineLastSentence = lineSentences[lineSentences.length - 1]
        const lineInitialSentences = lineSentences.slice(0, Math.max(lineSentences.length - 1, 0))

        const replModule = new Singleton({
          name: 'repl', members: [new Method({
            name: 'apply', body: new Body({
              sentences: [
                ...previousLinesSentences,
                ...lineInitialSentences,
                ...lineLastSentence.is('Expression') ? [new Return({ value: lineLastSentence })] :
                lineLastSentence.is('Assignment') ? [lineLastSentence, new Return({ value: lineLastSentence.variable })] :
                lineLastSentence.is('Variable') ? [lineLastSentence, new Return({ value: new Reference({ name: lineLastSentence.name }) })] :
                [lineLastSentence],
              ],
            }),
          })],
        })

        const mainPackage = new Package({ name: 'worksheet', members: [new Package({ name: 'main', members: [replModule] })] })
        return link([mainPackage], baseEnvironment)
      })

      const newOutputs = environmentsPerLine.map(environment => {
        if (!environment) return undefined

        const evaluation = Evaluation.build(environment, WRENatives)

        function* evaluate() {
          const response = yield* evaluation.send('apply', yield* evaluation.instantiate('worksheet.main.repl'))

          if (response) {
            const wDescription: RuntimeObject = (yield* evaluation.send('toString', response))!
            wDescription.assertIsString()
            return wDescription.innerValue
          } else return 'void'
        }

        const gen = evaluate()
        let next = gen.next()
        while(!next.done) next = gen.next()
        const description =next.value

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
          <button style={{ minWidth:'100px' }} onClick={evaluate}>RUN</button>
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