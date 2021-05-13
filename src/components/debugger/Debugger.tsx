import React, { createContext, useState } from 'react'
import { Layout, Model as LayoutModel, TabNode, Actions } from 'flexlayout-react'
import { RouteComponentProps } from '@reach/router'
import 'flexlayout-react/style/dark.css'
import $ from './Debugger.module.scss'
import classNames from 'classnames'
import LoadScreen from './LoadScreen'
import { Environment, Evaluation, ExecutionDirector, List, Name, Test, WRENatives } from 'wollok-ts'
import SourceDisplay from './SourceDisplay'
import ASTDisplay from './ASTDisplay'
import Toolbar from './Toolbar'
import Inspect from './Inspect'
import FrameStackDisplay from './FrameStackDisplay'
import BreakpointList from './BreakpointList'
import ObjectDiagramDisplay from './ObjectDiagramDisplay'


const WREFiles = async (): Promise<List<SourceFile>> => {
  const WRE = [
    'wollok/lang.wlk',
    'wollok/lib.wlk',
    'wollok/mirror.wlk',
    'wollok/vm.wlk',
    'wollok/game.wlk',
  ]

  return Promise.all(WRE.map(async name => {
    const file = await fetch(`${process.env.PUBLIC_URL}wre/${name}`)
    return { name, content: await file.text() }
  }))
}


const layoutConfiguration = (files: List<SourceFile>) => ({
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    enableDeleteWhenEmpty: false,
  },
  borders: [
    {
      type: 'border', location: 'left', size: 300, selected: 0, children: [
        { type: 'tab', name: 'Frame Stack', component: 'FrameStackDisplay' },
        { type: 'tab', name: 'Inspect', component: 'Inspect' },
        { type: 'tab', name: 'Breakpoints', component: 'BreakpointList' },
      ],
    },
    {
      type: 'border', location: 'right', size: 400, selected: 0, children: [
        { type: 'tab', name: 'AST', component: 'ASTDisplay' },
        { type: 'tab', name: 'Diagrama de Objetos', component: 'ObjectDiagramDisplay' },
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
        type: 'tabset', children: files.map(file => (
          { type:'tab', component:'SourceDisplay', name: file.name, id: file.name }
        )),
      },
    ],
  },
})

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
    case 'Inspect': return <Inspect />
    case 'FrameStackDisplay': return <FrameStackDisplay/>
    case 'BreakpointList': return <BreakpointList/>
    case 'SourceDisplay': return <SourceDisplay fileName={node.getId()}/>
    case 'ASTDisplay': return <ASTDisplay/>
    case 'ObjectDiagramDisplay': return <ObjectDiagramDisplay />
    default: return undefined
  }
}


export type SourceFile = { name: Name, content: string }

export type DebuggerState = {
  readonly files: List<SourceFile>
  readonly executionDirector: ExecutionDirector
  restart(): void
}


export const DebuggerContext = createContext<DebuggerState & {stateChanged: () => void }>(undefined as any)


const Debugger = ({ }: RouteComponentProps) => {
  const [state, setState] = useState<DebuggerState>()
  const stateChanged = () => setState({ ...state! })

  const handleTestSelection = async (files: List<SourceFile>, environment: Environment, test: Test): Promise<void> => {
    const evaluation = Evaluation.build(environment, WRENatives)
    const executionDirector = new ExecutionDirector(evaluation, evaluation.exec(test))
    executionDirector.resume(node => node === test.body)

    setState({
      executionDirector,
      files: [
        ...files,
        ...await WREFiles(),
      ],
      restart: () => handleTestSelection(files, environment, test),
    })
  }

  if (!state) return <LoadScreen onTestSelected={handleTestSelection} />

  const layout = LayoutModel.fromJson(layoutConfiguration(state.files))

  layout.doAction(Actions.selectTab(state.executionDirector.evaluation.currentNode.sourceFileName()!))

  return (
    <DebuggerContext.Provider value={{ ...state, stateChanged }}>
      <div className={$.Debugger}>
        <Toolbar/>
        <div className={$.content}>
          <Layout model={layout} factory={componentFactory} classNameMapper={classNameMapper} />
        </div>
      </div>
    </DebuggerContext.Provider>
  )
}

export default Debugger