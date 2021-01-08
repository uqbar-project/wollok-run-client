import React, { useContext, memo } from 'react'
import $ from './Details.module.scss'
import { ScrollTarget, contextHierarchy } from './Utils'
import classNames from 'classnames'
import Stack, { Stackable } from './Stack'
import { EvaluationContext } from './BytecodeDebuggerContexts'
import { VscDebugStepOver as StepThroughIcon, VscDebugStepInto as StepIntoIcon } from 'react-icons/vsc'
import { FaTrashAlt as GCIcon } from 'react-icons/fa'
import Id from './Id'
import Instruction from './Instruction'
import Section from './Section'
import Context from './Context'


export type DetailsProp = { }

const Details = ({ }: DetailsProp) => {

  const { evaluation, stepThroughEvaluation, setCurrentEvaluationIndex, currentEvaluationIndex, evaluationHistory, stepEvaluation, selectedFrame, garbageCollect } = useContext(EvaluationContext)

  const operandStack = [...selectedFrame?.operandStack?.map<Stackable>(operand => ({ label: <Id id={operand?.id}/> })) ?? []]

  return (
    <div className={$.container}>

      <div className={$.actions}>
        <button className={$.action} title='Step Into' onClick={stepEvaluation}><StepIntoIcon/></button>
        <button className={$.action} title='Step Through' onClick={stepThroughEvaluation}><StepThroughIcon/></button>
        <button className={$.actionDanger} title='Garbage Collect' onClick={garbageCollect}><GCIcon/></button>
      </div>

      <div className={$.history}>
        <input type='range' value={currentEvaluationIndex} min={0} max={evaluationHistory.length - 1} onChange={event => { setCurrentEvaluationIndex(Number(event.target.value)) }}/>
        <small>step {currentEvaluationIndex}/{evaluationHistory.length - 1}</small>
      </div>

      <div className={$.details}>
        <Section title='Instructions' contentClassName={$.instructions}>
          {selectedFrame?.instructions?.map((instruction, index) => (
            <ScrollTarget key={index} scrollIntoView={selectedFrame.nextInstructionIndex === index}>
              <Instruction
                instruction={instruction}
                className={classNames($.instruction, { [$.highlighted]: selectedFrame.nextInstructionIndex === index })}
              />
            </ScrollTarget>
          ))}
        </Section>

        <div>
          <Section title='Operand Stack'>
            <Stack stack={operandStack}/>
          </Section>
          <Section title='Context Hierarchy'>
            {
              contextHierarchy(evaluation, selectedFrame?.context).map(context =>
                <Context key={context.id} context={context} highlighted={selectedFrame!.baseContext === context}/>
              )
            }
          </Section>
        </div>
      </div>
    </div>
  )
}

export default memo(Details)