import React, { FocusEvent, useContext, useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { parse, RuntimeObject } from 'wollok-ts'
import { LocalScope } from 'wollok-ts/dist/linker'
import { VscAdd as AddIcon } from 'react-icons/vsc'
import $ from './Inspect.module.scss'
import { DebuggerContext } from './Debugger'

const Inspect = () => {
  const { executionDirector } = useContext(DebuggerContext)
  const [expressions, setExpressions] = useState<{text: string, result?: string}[]>([])

  const addExpression = () => setExpressions([...expressions, { text: '' }])
  const onExpressionBlur = (index: number) => (event: FocusEvent<HTMLInputElement>) => updateExpression(event.target.value, index)
  const onExpressionKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {if(event.key === 'Enter') event.currentTarget.blur() }

  const updateExpression = useCallback((expressionText: string, expressionIndex: number) => {
    let expressionResult: string
    try {
      const expression = parse.Expression.tryParse(expressionText)
      expression.forEach((node, parent) => {
        if(parent) node.cache.set('parent()', parent)
        Object.assign(node, { scope: new LocalScope(parent?.scope ?? executionDirector.evaluation.currentNode.scope) })
      })

      const result = executionDirector
        .fork(function * (evaluation) {
          const resultInstance = yield* evaluation.exec(expression)
          return resultInstance && (yield* evaluation.invoke('toString', resultInstance))
        })
        .finish()

      if(result.error) throw result.error
      if(result.result) {
        const resultInstance: RuntimeObject = result.result
        resultInstance.assertIsString()
        expressionResult = resultInstance?.innerValue
      } else {
        expressionResult = 'void'
      }
    } catch (error) {
      expressionResult = '<error>'
    }

    expressions[expressionIndex] = { text: expressionText, result: expressionResult }
    setExpressions([...expressions])
  }, [expressions, setExpressions, executionDirector])


  useEffect(() => {
    expressions.forEach(({ text }, index) => updateExpression(text, index))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [executionDirector.evaluation.frameStack.length])


  return (
    <div className={$.Inspect}>
      <div className={$.expressions}>
        {expressions.map((expression, index) =>
          <div className={$.expression} key={index}>
            <input type='text' onBlur={onExpressionBlur(index)} onKeyDown={onExpressionKeyDown} defaultValue={expression.text}/>
            <div>{expression.result ?? '---' }</div>
          </div>
        )}
      </div>
      <AddIcon onClick={addExpression}/>
    </div>
  )
}

export default Inspect