import React, { createContext, useState, ReactNode, Dispatch } from 'react'
import { Evaluation, buildEnvironment, interpret, List } from 'wollok-ts'
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
  currentEvaluationIndex: number
  setCurrentEvaluationIndex: Dispatch<number>
  evaluationHistory: List<Evaluation>
  selectedFrame?: Frame
  setSelectedFrame: Dispatch<Frame>
  stepEvaluation(): void
  stepThroughEvaluation(): void
  garbageCollect(): void
}

export const EvaluationContext = createContext<EvaluationState>(undefined as any)


type EvaluationContextProviderProps = {
  children: ReactNode
}

export const EvaluationContextProvider = ({ children }: EvaluationContextProviderProps ) => {
  
  const environment = buildEnvironment([])
  const { buildEvaluation, step, garbageCollect } = interpret(environment, wre as Natives)


  const [currentEvaluationIndex, setCurrentEvaluationIndex] = useState(0)
  const [evaluationHistory, setEvaluationHistory] = useState([buildEvaluation()])
  const currentEvaluation = evaluationHistory[currentEvaluationIndex]
  const [selectedFrame, setSelectedFrame] = useState(currentEvaluation.currentFrame())

  const stepEvaluation = () => {
    const next = currentEvaluation.copy()
    step(next)
    setEvaluationHistory([...evaluationHistory.slice(0, currentEvaluationIndex + 1), next])
    setCurrentEvaluationIndex(currentEvaluationIndex + 1)
    setSelectedFrame(next.currentFrame())
  }

  const stepThroughEvaluation = () => {
    const initialFrame = currentEvaluation.currentFrame()
    let next = currentEvaluation
    const skippedSteps: Evaluation[] = []
    do {
      next = next.copy()
      step(next)
      skippedSteps.push(next)
    } while (next.currentFrame()?.id !== initialFrame?.id)

    setEvaluationHistory([...evaluationHistory.slice(0, currentEvaluationIndex + 1), ...skippedSteps])
    setCurrentEvaluationIndex(currentEvaluationIndex + skippedSteps.length)
    setSelectedFrame(next.currentFrame())
  }

  const updateCurrentEvaluationIndex = (index: number) => {
    setCurrentEvaluationIndex(index)
    setSelectedFrame(evaluationHistory[index].currentFrame())
  }

  const garbageCollectEvaluation = () => {
    const next = currentEvaluation.copy()
    garbageCollect(next)
    setEvaluationHistory([...evaluationHistory.slice(0, currentEvaluationIndex + 1), next])
    setCurrentEvaluationIndex(currentEvaluationIndex + 1)
    setSelectedFrame(next.currentFrame())
  }

  return (
    <EvaluationContext.Provider value={{
      evaluation: currentEvaluation,
      currentEvaluationIndex, setCurrentEvaluationIndex: updateCurrentEvaluationIndex,
      evaluationHistory,
      stepEvaluation, stepThroughEvaluation,
      garbageCollect: garbageCollectEvaluation,
      selectedFrame, setSelectedFrame,
    }}>
      {children}
    </EvaluationContext.Provider>
  )
}