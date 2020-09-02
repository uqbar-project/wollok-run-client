import React, { memo, useContext } from 'react'
import Id from './Id'
import Stack, { Stackable } from './Stack'
import Instruction from './Instruction'
import { EvaluationContext } from './BytecodeDebuggerContexts'
import Section from './Section'
import $ from './FrameStack.module.scss'

export type FrameStackProps = { }

const FrameStack = ({}: FrameStackProps) => {
  const { evaluation, selectedFrame, setSelectedFrame } = useContext(EvaluationContext)

  const frameStack = evaluation.listFrames().map<Stackable>((frame, index, frames) => {
    const previousFrame = frames[index - 1]
    const triggeringInstruction = previousFrame?.instructions?.[previousFrame?.nextInstruction - 1]

    return {
      label: triggeringInstruction && <Instruction instruction={triggeringInstruction}/>,
      subLabel: <Id id={frame.id}/>,
      selected: selectedFrame === frame,
      onClick: () => setSelectedFrame(frame),
    }
  })

  return (
    <Section title='Frame Stack' className={$.container}>
      <Stack elements={frameStack}/>
    </Section>
  )
}

export default memo(FrameStack)