import React, { createContext, useState } from 'react'
import { Layout, Model as LayoutModel, TabNode } from 'flexlayout-react'
import { RouteComponentProps } from '@reach/router'
import 'flexlayout-react/style/dark.css'
import $ from './Debugger.module.scss'
import classNames from 'classnames'
import LoadScreen from './LoadScreen'
import { Environment, List, Name, Test } from 'wollok-ts'
import SourceDisplay from './SourceDisplay'
import ASTDisplay from './ASTDisplay'

const layoutConfiguration = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableTabStrip: false,
  },
  borders: [
    {
      type: 'border', location: 'left', size: 300, selected: 0, children: [
        { type: 'tab', name: 'Tools', component: 'Tools' },
      ],
    },
    {
      type: 'border', location: 'right', size: 400, children: [
        { type: 'tab', name: 'AST', component: 'ASTDisplay' },
      ],
    },
    {
      type: 'border', location: 'bottom', size: 200, children: [
        { type: 'tab', name: 'Logs' },
      ],
    },
  ],
  layout: {
    type: 'row', children: [
      {
        type: 'tabset', weight: 25, selected: 0, children: [
        ],
      },
      {
        type: 'tabset', weight: 75, selected: 0, children: [
          { type: 'tab', component: 'SourceDisplay' },
        ],
      },
    ],
  },
}

const classNameMapper = (originalName: string) => {
  switch (originalName) {
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

const componentFactory = (node: TabNode) => {
  switch (node.getComponent()) {
    case 'Tools': return <div>Acá muestro las Tools</div>
    case 'SourceDisplay': return <SourceDisplay />
    case 'ASTDisplay': return <ASTDisplay/>
    default: return undefined
  }
}

export type DebuggerState = {
  readonly environment: Environment
  readonly debuggedNode: Test
  readonly files: List<{name: Name, content: string}>
}

export const DebuggerContext = createContext<DebuggerState>(undefined as any)

const Debugger = ({ }: RouteComponentProps) => {
  const [state, setState] = useState<DebuggerState>()

  if (!state) return <LoadScreen setDebuggerState={setState} />

  return (
    <DebuggerContext.Provider value={state}>
      <div className={$.Debugger}>
        <div>Acá muestro la ToolBar</div>
        <div className={$.content}>
          <Layout model={LayoutModel.fromJson(layoutConfiguration)} factory={componentFactory} classNameMapper={classNameMapper} />
        </div>
      </div>
    </DebuggerContext.Provider>
  )
}

export default Debugger