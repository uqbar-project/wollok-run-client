import React, { useContext } from 'react'
import { VscArrowSmallDown, VscDebugStepBack as StepBackIcon, VscDebugContinue as ResumeIcon, VscDebugStepInto as StepInIcon, VscDebugStepOver as StepOverIcon, VscDebugStepOut as StepOutIcon, VscDebugRestart as RestartIcon } from 'react-icons/vsc'
import { DebuggerContext } from './Debugger'
import $ from './Toolbar.module.scss'

const Toolbar = () => {
  const { executionDirector, stateChanged } = useContext(DebuggerContext)

  const stepIn = () => {
    executionDirector.stepIn()
    stateChanged()
  }
  
  const stepOver = () => {
    executionDirector.stepOver()
    stateChanged()
  }
  
  const stepOut = () => {
    executionDirector.stepOut()
    stateChanged()
  }
  
  const stepThrough = () => {
    executionDirector.stepThrough()
    stateChanged()
  }
  
  const resume = () => {
    executionDirector.resume()
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
      <button title="Restart"><RestartIcon/></button>
    </div>
  )
}

export default Toolbar