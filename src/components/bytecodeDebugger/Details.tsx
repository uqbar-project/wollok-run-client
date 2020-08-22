import React, { useContext } from 'react'
import $ from './Details.module.scss'
import { Instruction, ScrollTarget, Id } from './Utils'
import classNames from 'classnames'
import Stack, { Stackable } from './Stack'
import { BytecodeDebuggerContext } from './BytecodeDebuggerContext'


export type DetailsProp = { }

const Details = ({ }: DetailsProp) => {
  
  const { stepEvaluation, selectedFrame: frame } = useContext(BytecodeDebuggerContext)

  const operandStack = frame?.operandStack?.map<Stackable>(operand => ({ label: <Id id={operand}/> })) ?? []

  return (
    <div className={$.container}>
      <div className={$.actions}>
        <button onClick={stepEvaluation}>Step</button>
      </div>
      <div className={$.details}>
        <div>
          <h2>Instructions</h2>
          <div className={$.instructions}>
            {frame?.instructions?.map((instruction, index) => (
              <ScrollTarget key={index} scrollIntoView={frame.nextInstruction === index}>
                <Instruction
                  instruction={instruction}
                  className={classNames($.instruction, { [$.highlighted]: frame.nextInstruction === index })}
                />
              </ScrollTarget>
            ))}
          </div>
        </div>
        <Stack title='Operand Stack' elements={operandStack}/>
      </div>
    </div>
  )
}

export default Details