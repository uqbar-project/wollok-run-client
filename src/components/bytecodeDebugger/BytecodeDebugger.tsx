import React, { useState } from 'react'
import { Layout, Model as LayoutModel, TabNode } from 'flexlayout-react'
import { RouteComponentProps } from '@reach/router'
import 'flexlayout-react/style/dark.css'
import $ from './BytecodeDebugger.module.scss'
import Details from './Details'
import classNames from 'classnames'
import ContextSearchList from './ContextSearchList'
import InstanceSearchList from './InstanceSearchList'
import { EvaluationContextProvider, LayoutContextProvider } from './BytecodeDebuggerContexts'
import FrameStack from './FrameStack'

// TODO:
// - Add context hierarchy to frame details
// - Save evaluations to navigable story
// - More Steps and GC buttons
// - Collapse long strings with (...)
// - Check performance
// - Expand and collapse contexts
// - Open a test somehow
// - Add logs directly to tab (would be nice to have actually collapsable nested contexts)
// - Extract simple Section component, with h2 and content
// - Remove the 2 specific SearchList subcomponents?


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
      type: 'border', location: 'right', size: 400, children: [
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

const componentForNode = (node: TabNode) => {
  switch(node.getComponent()) {
    case 'FrameStack': return <FrameStack />
    case 'Details': return <Details />
    case 'Contexts': return <ContextSearchList />
    case 'Instances': return <InstanceSearchList />
    default: return undefined
  }
}


const BytecodeDebugger = ({}: RouteComponentProps) => {
  const [layout] = useState(LayoutModel.fromJson(layoutConfiguration))

  return (
    <LayoutContextProvider layout={layout}>
      <EvaluationContextProvider>
        <Layout model={layout} factory={componentForNode} classNameMapper={className}/>
      </EvaluationContextProvider>
    </LayoutContextProvider>
  )
}

export default BytecodeDebugger