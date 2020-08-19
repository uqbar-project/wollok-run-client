import React, { useState, memo, useRef, useEffect, ChangeEvent } from 'react'
import { RouteComponentProps } from '@reach/router'
import { interpret, buildEnvironment, Evaluation, Id, List } from 'wollok-ts/dist'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { Natives, Instruction as InstructionType, Frame as FrameType, Context as ContextType } from 'wollok-ts/dist/interpreter'
import {FiSearch as SearchIcon} from 'react-icons/fi'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import $ from './BytecodeDebugger.module.scss'

const {isArray} = Array
const {keys} = Object


const environment = buildEnvironment([])
const { buildEvaluation, step } = interpret(environment, wre as Natives)
const baseEvaluation: Evaluation = buildEvaluation()


const short = (longId: Id) => `#${longId.slice(longId.lastIndexOf('-') + 1)}`
const contextHierarchy = (evaluation: Evaluation, start?: Id | null): List<ContextType> => {
  if(!start) return []
  const next = evaluation.context(start)
  return [next, ...contextHierarchy(evaluation, next.parent)]
}

type FrameProps = {
  id: string,
  label: string,
  isSelected: Boolean,
  onClick: () => void,
}

const Frame = ({label, id, isSelected, onClick }: FrameProps) => {
  return (
    <div className={`${$.block} ${isSelected ? $.highlighted : ''}`} onClick={onClick}>
      <div>{label}</div>
      <div className={$.id}>{short(id)}</div>
    </div>
  )
}


type InstructionProps = {
  instruction: InstructionType,
  isNext: boolean,
} 

const Instruction = ({ instruction, isNext }: InstructionProps) => {
  const args: List<any> = (() => {
    switch(instruction.kind) {
      case 'LOAD': return [instruction.name, instruction.lazyInitialization ? 'lazy' : undefined]
      case 'STORE': return [instruction.name, instruction.lookup]
      case 'PUSH': return [short(instruction.id)]
      case 'PUSH_CONTEXT': return [ instruction.exceptionHandlerIndexDelta ]
      case 'SWAP': return [ instruction.distance ]
      case 'INSTANTIATE':  return [ instruction.module, isArray(instruction.innerValue) ? instruction.innerValue.map(short) : instruction.innerValue ]
      case 'INHERITS':  return [ instruction.module ]
      case 'JUMP':
      case 'CONDITIONAL_JUMP': return [ instruction.count ]
      case 'CALL': return [ `${instruction.message}/${instruction.arity}`, instruction.useReceiverContext, instruction.lookupStart ]
      case 'INIT': return [ `${instruction.lookupStart}/${instruction.arity}`, instruction.optional]
      case 'INIT_NAMED': return instruction.argumentNames
      default: return []
    }
  })()

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if(isNext) ref.current?.scrollIntoView()
  }, [isNext, ref])

  return (
    <div ref={ref} className={`${$.instruction} ${isNext ? $.highlighted : ''}`}>
      {instruction.kind}{args.length ? '(' : ''}{args[0]}{args.slice(1).flatMap(arg => arg ? [', ', arg] : [])}{args.length ? ')' : ''}
    </div>
  )
}


export type BytecodeDebuggerProps = RouteComponentProps
const BytecodeDebugger = (_props: BytecodeDebuggerProps) => {

  const [ evaluation, setEvaluation ] = useState(baseEvaluation)
  const [ selectedFrame, setSelectedFrame ] = useState(baseEvaluation.currentFrame())
  const [ contextSearch, setContextSearch ] = useState('')
  const [ instanceSearch, setInstanceSearch ] = useState('')
  
  const onStep = () => {
    const next = evaluation.copy()
    step(next)
    setEvaluation(next)
    setSelectedFrame(next.currentFrame())
  }

  const onFrameSelected = (frame: FrameType) => () => {
    setSelectedFrame(frame)
  }

  const onContextSearchChange = (event: ChangeEvent<HTMLInputElement>) => setContextSearch(event.target.value)
  const onInstanceSearchChange = (event: ChangeEvent<HTMLInputElement>) => setInstanceSearch(event.target.value)

  return (
    <div className={$.container}>
      <div className={$.frameStack}>
        <h2>Frame Stack</h2>
        <div className={$.stack}>
          {evaluation.listFrames().map((frame, index, frames) => {
            const previousFrame = frames[index - 1] as FrameType | undefined
            const triggeringInstruction = previousFrame?.instructions?.[previousFrame?.nextInstruction - 1]
            const label =
              !triggeringInstruction ? '' :
              triggeringInstruction.kind === 'INIT' ? `init ${triggeringInstruction.lookupStart}/${triggeringInstruction.arity}` :
              triggeringInstruction.kind === 'CALL' ? `call ${triggeringInstruction.message}/${triggeringInstruction.arity}` :
              triggeringInstruction.kind.toLowerCase()

            return <Frame
              label={label}
              id={frame.id}
              key={frame.id}
              isSelected={selectedFrame === frame}
              onClick={onFrameSelected(frame)}
            />
          })}
        </div>
      </div>
      <div className={$.actions}>
        <button onClick={onStep}>Step</button>
        <button>Step Through</button>
        <button>Step Out</button>
      </div>
      <div className={$.main}>
        <div className={$.instructions}>
          {selectedFrame?.instructions?.map((instruction, index) => (
            <Instruction instruction={instruction} key={index} isNext={selectedFrame?.nextInstruction === index}/>
          ))}
        </div>

        <div>
          <h3>Operand Stack</h3>
          <div className={$.stack}>
            {selectedFrame?.operandStack?.map((operand, index) => {
              const instance = evaluation.maybeInstance(operand)
            return <div className={$.block} key={index}>{instance?.moduleFQN ?? ''}{short(operand)}</div>
            })}
          </div>
        </div>
      </div>
      <div className={$.info}>
        <Tabs className={$.tabs} selectedTabClassName={$.selected}>
          <TabPanel>
            <div className={$.contexts}>
              <h2>Contexts <div><SearchIcon/><input onChange={onContextSearchChange} /></div></h2>
              {contextHierarchy(evaluation, selectedFrame?.context).map(context => {
                return (
                  <div key={context.id} className={$.context}>
                    <h4>{short(context.id)}</h4>
                    {
                      keys(context.locals)
                        .filter(name => name.includes(contextSearch) || short(context.locals[name]).includes(contextSearch) )
                        .map(name =>{
                          const instance = evaluation.maybeInstance(context.locals[name])
                          return (
                            <div key={name}>
                              <div>{name}:</div>
                              <div>{instance?.moduleFQN}{short(context.locals[name])}</div>
                            </div>
                          )
                        })
                    }
                  </div>
                )
              })}
            </div>
          </TabPanel>
          <TabPanel>
            <div className={$.instances}>
              <h2>Instances <div><SearchIcon/><input onChange={onInstanceSearchChange} /></div></h2>
              {evaluation.listInstances()
                .filter(instance => instance.id.includes(instanceSearch) || instance.moduleFQN.includes(instanceSearch) )
                .map(instance => {
                  return (
                    <div key={instance.id} className={$.instance}>
                      {instance?.moduleFQN}{short(instance.id)}
                    </div>
                  )
                })
              }
            </div>
          </TabPanel>

          <TabList>
            <Tab><h3>Contexts</h3></Tab>
            <Tab><h3>Instances</h3></Tab>
          </TabList>
        </Tabs>
      </div>
    </div>
  )
}

export default memo(BytecodeDebugger)