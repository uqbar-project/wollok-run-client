import React, { createContext, useState, ReactNode, Dispatch } from 'react'
import { Evaluation, List, Environment, Id as IdType, WRENatives, Name, RuntimeObject, Frame, compile, Node, garbageCollect } from 'wollok-ts'
import { Model as LayoutModel, Actions as LayoutActions } from 'flexlayout-react'
import { INIT, PUSH } from 'wollok-ts/dist/interpreter/compiler'

const { selectTab } = LayoutActions


// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// LAYOUT CONTEXT
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface LayoutState {
  instanceSearch: string
  setInstanceSearch: Dispatch<string>
}

export const LayoutContext = createContext<LayoutState>(undefined as any)


type LayoutContextProviderProps = {
  children: ReactNode
  layout: LayoutModel
}

export const LayoutContextProvider = ({ children, layout }: LayoutContextProviderProps ) => {

  const [instanceSearch, updateInstanceSearch] = useState('')

  const setInstanceSearch = (search: string) => {
    updateInstanceSearch(search)
    const instanceTab = layout.getBorderSet().getBorders()[1].getChildren()[0]
    if(!instanceTab.isVisible()) layout.doAction(selectTab(instanceTab.getId()))
  }

  return (
    <LayoutContext.Provider value={{ instanceSearch, setInstanceSearch }}>
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
  rootFrameName: Name
}

export const EvaluationContext = createContext<EvaluationState>(undefined as any)


type EvaluationContextProviderProps = {
  children: ReactNode
  environment: Environment
  testId: IdType
}

export const EvaluationContextProvider = ({ environment, testId, children }: EvaluationContextProviderProps ) => {
  const test = environment.getNodeById<'Test'>(testId)

  const [currentEvaluationIndex, setCurrentEvaluationIndex] = useState(0)
  const [evaluationHistory, setEvaluationHistory] = useState(() => {
    const evaluation = Evaluation.create(environment, WRENatives)

    const describe: Node = test.parent()
    let parentContext = evaluation.rootContext
    if (describe.is('Describe')) {
      const describeInstance = RuntimeObject.object(evaluation, describe as any)

      evaluation.pushFrame(new Frame(describeInstance, [
        PUSH(describeInstance.id),
        INIT([]),
        ...describe.fixtures().flatMap(fixture => compile(fixture)),
      ]))
      evaluation.stepAll()
      parentContext = describeInstance
    }

    evaluation.frameStack.push(new Frame(parentContext, compile(test)))

    return [evaluation]
  })
  const currentEvaluation = evaluationHistory[currentEvaluationIndex]
  const [selectedFrame, setSelectedFrame] = useState(currentEvaluation.frameStack.top)

  const stepEvaluation = () => {
    const next = currentEvaluation.copy()

    try { next.stepIn() }
    catch (error) {
      console.log(error)
      alert(error)
    }

    setEvaluationHistory([...evaluationHistory.slice(0, currentEvaluationIndex + 1), next])
    setCurrentEvaluationIndex(currentEvaluationIndex + 1)
    setSelectedFrame(next.frameStack.top)
  }

  const stepThroughEvaluation = () => {
    const skippedSteps: Evaluation[] = []
    const startingDepth = [...currentEvaluation.frameStack].indexOf(selectedFrame!) + 1
    let next = currentEvaluation
    do {
      next = next.copy()
      skippedSteps.push(next)
      try { next.stepIn() }
      catch (error) {
        console.log(error)
        alert(error)
        break
      }
    } while (next.frameStack.depth > startingDepth)

    setEvaluationHistory([...evaluationHistory.slice(0, currentEvaluationIndex + 1), ...skippedSteps])
    setCurrentEvaluationIndex(currentEvaluationIndex + skippedSteps.length)
    setSelectedFrame(next.frameStack.top)
  }

  const updateCurrentEvaluationIndex = (index: number) => {
    setCurrentEvaluationIndex(index)
    setSelectedFrame(evaluationHistory[index].frameStack.top)
  }

  const garbageCollectEvaluation = () => {
    const next = currentEvaluation.copy()
    garbageCollect(next)
    setEvaluationHistory([...evaluationHistory.slice(0, currentEvaluationIndex + 1), next])
    setCurrentEvaluationIndex(currentEvaluationIndex + 1)
    setSelectedFrame(next.frameStack.top)
  }

  return (
    <EvaluationContext.Provider value={{
      evaluation: currentEvaluation,
      currentEvaluationIndex, setCurrentEvaluationIndex: updateCurrentEvaluationIndex,
      evaluationHistory,
      stepEvaluation, stepThroughEvaluation,
      garbageCollect: garbageCollectEvaluation,
      selectedFrame, setSelectedFrame,
      rootFrameName: test.name,
    }}>
      {children}
    </EvaluationContext.Provider>
  )
}