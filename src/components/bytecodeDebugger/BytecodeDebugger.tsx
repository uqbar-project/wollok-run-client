import React, { useState } from 'react'
import { Layout, Model as LayoutModel, TabNode } from 'flexlayout-react'
import { interpret, buildEnvironment, Evaluation } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { RouteComponentProps } from '@reach/router'
import 'flexlayout-react/style/dark.css'
import $ from './BytecodeDebugger.module.scss'
import Stack, { Stackable } from './Stack'
import { Instruction, Id } from './Utils'
import Details from './Details'
import classNames from 'classnames'
import ContextSearchList from './ContextSearchList'
import InstanceSearchList from './InstanceSearchList'

// TODO:
// - Augment instances id's with the qualified version (might need to move evaluation to a React Context for this)
// - Make Id's links to open their context / instance
// - Expand instances to see inner values and locals from inherited contexts
// - Add context hierarchy to frame details
// - Save evaluations to navigable story
// - More Steps and GC buttons
// - Open a test somehow
// - Add logs directly to tab (would be nice to have actually collapsable nested contexts)


const layoutConfiguration = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableTabStrip:false,
  },
  borders: [
    {
      type: 'border', location: 'bottom', size: 200, children: [
        { type: 'tab', name: 'Logs' },
      ],
    },
    {
      type: 'border', location: 'right', size: 300, children: [
        { type: 'tab', name: 'Contexts', component: 'Contexts' },
        { type: 'tab', name: 'Instances', component: 'Instances' },
      ],
    },
  ],
  layout: {
    type: 'row', children: [
      {
        type: 'tabset', weight: 25, selected: 0, children: [
          { type: 'tab', component: 'FrameStack' },
        ], 
      },
      {
        type: 'tabset', weight: 75, selected: 0, children: [
          { type: 'tab', component: 'Details' },
        ],
      },
    ],
  },
}

const className = (originalName: string) => {
  switch(originalName) {
    case 'flexlayout__tab':
      return classNames(originalName, $.panel)
    case 'flexlayout__splitter':
      return classNames(originalName, $.splitter)
    case 'flexlayout__border_top':
    case 'flexlayout__border_right':
    case 'flexlayout__border_bottom':
    case 'flexlayout__border_left':
      return classNames(originalName, $.border)
    case 'flexlayout__border_button_content':
      return classNames(originalName, $.borderTab)
    default: return originalName
  }
}

const environment = buildEnvironment([])
const { buildEvaluation, step } = interpret(environment, wre as Natives)
const baseEvaluation: Evaluation = buildEvaluation()

type Props = RouteComponentProps

const BytecodeDebugger = ({}: Props) => {
  const [layout] = useState(LayoutModel.fromJson(layoutConfiguration))
  const [evaluation, setEvaluation] = useState(baseEvaluation)
  const [selectedFrame, setSelectedFrame] = useState(baseEvaluation.currentFrame())

  const actions = {
    Step() {
      const next = evaluation.copy()
      step(next)
      setEvaluation(next)
      setSelectedFrame(next.currentFrame())
    },
  }

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

  const componentForNode = (node: TabNode) => {
    switch(node.getComponent()) {
      case 'FrameStack': return <Stack title='Frame Stack' elements={frameStack}/>
      case 'Details': return <Details actions={actions} frame={selectedFrame}/>
      case 'Contexts': return <ContextSearchList evaluation={evaluation} />
      case 'Instances': return <InstanceSearchList evaluation={evaluation} />
      default: return undefined
    }
  }
  
  return <Layout model={layout} factory={componentForNode} classNameMapper={className}/>
}

export default BytecodeDebugger