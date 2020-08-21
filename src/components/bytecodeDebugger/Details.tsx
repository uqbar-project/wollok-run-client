import React from 'react'
import $ from './Details.module.scss'
import { Frame } from 'wollok-ts/dist/interpreter'
import { Instruction, ScrollTarget, Id } from './Utils'
import classNames from 'classnames'
import Stack, { Stackable } from './Stack'

const { keys } = Object


export type DetailsProp = {
  actions: Record<string, () => void>
  frame?: Frame
}

const Details = ({ actions, frame }: DetailsProp) => {
  
  const operandStack = frame?.operandStack?.map<Stackable>(operand => ({ label: <Id id={operand}/> })) ?? []

  return (
    <div className={$.container}>
      <div className={$.actions}>
        {keys(actions).map(name => <button onClick={actions[name]} key={name}>{name}</button>)}
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