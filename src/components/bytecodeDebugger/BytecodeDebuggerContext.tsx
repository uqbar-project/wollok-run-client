import React, { createContext, useState, ReactNode, Dispatch } from 'react'
import { Evaluation, buildEnvironment, interpret } from 'wollok-ts'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { Natives, Frame } from 'wollok-ts/dist/interpreter'
import { Model as LayoutModel, Actions as LayoutActions } from 'flexlayout-react'

const { selectTab } = LayoutActions


interface BytecodeDebuggerState {
  evaluation: Evaluation
  selectedFrame?: Frame
  setSelectedFrame: Dispatch<Frame>
  stepEvaluation(): void
  instanceSearch: string
  setInstanceSearch: Dispatch<string>
  contextSearch: string
  setContextSearch: Dispatch<string>
  selectContextsTab(): void
  selectInstancesTab(): void
}

type BytecodeDebuggerContextProps = {
  children: ReactNode
  layout: LayoutModel
}

export const BytecodeDebuggerContext = createContext<BytecodeDebuggerState>(undefined as any)

const BytecodeDebuggerContextProvider = ({ children, layout }: BytecodeDebuggerContextProps ) => {
  
  const environment = buildEnvironment([])
  const { buildEvaluation, step } = interpret(environment, wre as Natives)


  const [evaluation, setEvaluation] = useState(buildEvaluation())
  const [selectedFrame, setSelectedFrame] = useState(evaluation.currentFrame())
  const [instanceSearch, setInstanceSearch] = useState('')
  const [contextSearch, setContextSearch] = useState('')
  
  const stepEvaluation = () => {
    const next = evaluation.copy()
    step(next)
    setEvaluation(next)
    setSelectedFrame(next.currentFrame())
  }

  const selectInstancesTab = () => {
    const instanceTab = layout.getBorderSet().getBorders()[1].getChildren()[0]
    if(!instanceTab.isVisible()) layout.doAction(selectTab(instanceTab.getId()))
  }

  const selectContextsTab = () => {
    const contextTab = layout.getBorderSet().getBorders()[1].getChildren()[1]
    if(!contextTab.isVisible()) layout.doAction(selectTab(contextTab.getId()))
  }

  return (
    <BytecodeDebuggerContext.Provider value={{
      evaluation,
      stepEvaluation,
      selectedFrame, setSelectedFrame,
      instanceSearch, setInstanceSearch,
      contextSearch, setContextSearch,
      selectInstancesTab,
      selectContextsTab,
    }}>
      {children}
    </BytecodeDebuggerContext.Provider>
  )
}

export default BytecodeDebuggerContextProvider