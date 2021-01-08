import React, { memo, useContext } from 'react'
import Stack, { Stackable } from './Stack'
import Instruction from './Instruction'
import { EvaluationContext } from './BytecodeDebuggerContexts'
import Section from './Section'
import $ from './FrameStack.module.scss'

export type FrameStackProps = { }

const FrameStack = ({ }: FrameStackProps) => {
  const { evaluation, selectedFrame, setSelectedFrame, rootFrameName } = useContext(EvaluationContext)

  const frameStack = [...evaluation.frameStack].map<Stackable>((frame, index, frames) => {
    const previousFrame = frames[index - 1]
    const triggeringInstruction = previousFrame?.instructions?.[previousFrame?.nextInstructionIndex - 1]

    return {
      label: triggeringInstruction
        ? <Instruction instruction={triggeringInstruction}/>
        : rootFrameName,
      selected: selectedFrame === frame,
      onClick: () => setSelectedFrame(frame),
    }
  })

  return (
    <Section title='Frame Stack' className={$.container}>
      <Stack stack={frameStack}/>
    </Section>
  )
}

export default memo(FrameStack)