import React, { createContext, useState, ReactNode, Dispatch } from 'react'
import { Evaluation, buildEnvironment, interpret } from 'wollok-ts'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { Natives, Frame } from 'wollok-ts/dist/interpreter'
import { Model as LayoutModel, Actions as LayoutActions } from 'flexlayout-react'

const { selectTab } = LayoutActions


// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// LAYOUT CONTEXT
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface LayoutState {
  instanceSearch: string
  setInstanceSearch: Dispatch<string>
  contextSearch: string
  setContextSearch: Dispatch<string>
}

export const LayoutContext = createContext<LayoutState>(undefined as any)


type LayoutContextProviderProps = {
  children: ReactNode
  layout: LayoutModel
}

export const LayoutContextProvider = ({ children, layout }: LayoutContextProviderProps ) => {
  
  const [instanceSearch, updateInstanceSearch] = useState('')
  const [contextSearch, updateContextSearch] = useState('')
  
  const setInstanceSearch = (search: string) => {
    updateInstanceSearch(search)
    const instanceTab = layout.getBorderSet().getBorders()[1].getChildren()[1]
    if(!instanceTab.isVisible()) layout.doAction(selectTab(instanceTab.getId()))
  }

  const setContextSearch = (search: string) => {
    updateContextSearch(search)
    const contextTab = layout.getBorderSet().getBorders()[1].getChildren()[0]
    if(!contextTab.isVisible()) layout.doAction(selectTab(contextTab.getId()))
  }

  return (
    <LayoutContext.Provider value={{
      instanceSearch, setInstanceSearch,
      contextSearch, setContextSearch,
    }}>
      {children}
    </LayoutContext.Provider>
  )
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// EVALUATION CONTEXT
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface EvaluationState {
  evaluation: Evaluation
  selectedFrame?: Frame
  setSelectedFrame: Dispatch<Frame>
  stepEvaluation(): void
}

export const EvaluationContext = createContext<EvaluationState>(undefined as any)


type EvaluationContextProviderProps = {
  children: ReactNode
}

export const EvaluationContextProvider = ({ children }: EvaluationContextProviderProps ) => {
  
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
    <EvaluationContext.Provider value={{
      evaluation,
      stepEvaluation,
      selectedFrame, setSelectedFrame,
    }}>
      {children}
    </EvaluationContext.Provider>
  )
}