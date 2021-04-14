import React, { useContext } from 'react'
import { VscArrowSmallDown, VscDebugStepBack as StepBackIcon, VscDebugContinue as ResumeIcon, VscDebugStepInto as StepInIcon, VscDebugStepOver as StepOverIcon, VscDebugStepOut as StepOutIcon, VscDebugRestart as RestartIcon } from 'react-icons/vsc'
import { DebuggerContext } from './Debugger'
import $ from './Toolbar.module.scss'

const Toolbar = () => {
  const { executionDirector, stateChanged, restart } = useContext(DebuggerContext)

  const stepIn = () => {
    const result = executionDirector.stepIn()
    if(result.done) alert('Evaluation finished!')
    stateChanged()
  }

  const stepOver = () => {
    const result = executionDirector.stepOver()
    if(result.done) alert('Evaluation finished!')
    stateChanged()
  }

  const stepOut = () => {
    const result = executionDirector.stepOut()
    if(result.done) alert('Evaluation finished!')
    stateChanged()
  }

  const stepThrough = () => {
    const result = executionDirector.stepThrough()
    if(result.done) alert('Evaluation finished!')
    stateChanged()
  }

  const resume = () => {
    const result = executionDirector.resume()
    if(result.done) alert('Evaluation finished!')
    stateChanged()
  }

  return (
    <div className={$.Toolbar}>
      <button title="Step Back"><StepBackIcon/></button>
      <button title="Resume" onClick={resume}><ResumeIcon/></button>
      <button title="Step In" onClick={stepIn}><StepInIcon/></button>
      <button title="Step Over" onClick={stepOver}><StepOverIcon/></button>
      <button title="Step Through" onClick={stepThrough}><StepOverIcon/><VscArrowSmallDown/></button>
      <button title="Step Out" onClick={stepOut}><StepOutIcon/></button>
      <div className={$.separator}/>
      <button title="Restart" onClick={restart}><RestartIcon/></button>
    </div>
  )
}

export default Toolbar