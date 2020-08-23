import React, { useContext, memo } from 'react'
import $ from './Details.module.scss'
import { ScrollTarget } from './Utils'
import classNames from 'classnames'
import Stack, { Stackable } from './Stack'
import { EvaluationContext } from './BytecodeDebuggerContexts'
import Id from './Id'
import Instruction from './Instruction'
import Section from './Section'


export type DetailsProp = { }

const Details = ({ }: DetailsProp) => {
  
  const { stepEvaluation, selectedFrame: frame } = useContext(EvaluationContext)

  const operandStack = frame?.operandStack?.map<Stackable>(operand => ({ label: <Id id={operand}/> })) ?? []

  return (
    <div className={$.container}>
      <div className={$.actions}>
        <button onClick={stepEvaluation}>Step</button>
      </div>
      <div className={$.details}>
        <div>
          <Section title='Instructions' containerClassName={$.instructions}>
            {frame?.instructions?.map((instruction, index) => (
              <ScrollTarget key={index} scrollIntoView={frame.nextInstruction === index}>
                <Instruction
                  instruction={instruction}
                  className={classNames($.instruction, { [$.highlighted]: frame.nextInstruction === index })}
                />
              </ScrollTarget>
            ))}
          </Section>
        </div>
        <Section title='Operand Stack'>
          <Stack elements={operandStack}/>
        </Section>
      </div>
    </div>
  )
}

export default memo(Details)