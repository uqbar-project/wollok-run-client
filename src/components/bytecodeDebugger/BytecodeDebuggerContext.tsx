import React, { createContext, useState, ReactNode, Dispatch } from 'react'
import { Evaluation, buildEnvironment, interpret } from 'wollok-ts'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { Natives, Frame } from 'wollok-ts/dist/interpreter'


interface BytecodeDebuggerState {
  evaluation: Evaluation
  selectedFrame?: Frame
  setSelectedFrame: Dispatch<Frame>
  stepEvaluation(): void
}

type BytecodeDebuggerContextProps = {
  children: ReactNode
}

export const BytecodeDebuggerContext = createContext<BytecodeDebuggerState>(undefined as any)

const BytecodeDebuggerContextProvider = ({ children }: BytecodeDebuggerContextProps ) => {
  
  const environment = buildEnvironment([])
  const { buildEvaluation, step } = interpret(environment, wre as Natives)


  const [evaluation, setEvaluation] = useState(buildEvaluation())
  const [selectedFrame, setSelectedFrame] = useState(evaluation.currentFrame())
  
  const stepEvaluation = () => {
    const next = evaluation.copy()
    step(next)
    setEvaluation(next)
    setSelectedFrame(next.currentFrame())
  }

  return (
    <BytecodeDebuggerContext.Provider value={{
      evaluation,
      selectedFrame,
      setSelectedFrame,
      stepEvaluation,
    }}>
      {children}
    </BytecodeDebuggerContext.Provider>
  )
}

export default BytecodeDebuggerContextProvider