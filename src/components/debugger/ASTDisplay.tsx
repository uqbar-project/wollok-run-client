import React, { useContext, useState } from 'react'
import { Node } from 'wollok-ts'
import { DebuggerContext } from './Debugger'
import Tree, { TreeProps, TreeNodeProps } from 'rc-tree'
import { VscSymbolOperator as SentenceIcon, VscTriangleRight as SwitcherCollapsedIcon, VscTriangleDown as SwitcherExpandedIcon, VscSymbolClass as EnvironmentIcon, VscSymbolInterface as ModuleIcon, VscSymbolNamespace as PackageIcon, VscCircleFilled as ItemIcon, VscBeaker as TestIcon, VscSymbolMethod as MethodIcon, VscSymbolField as FieldIcon } from 'react-icons/vsc'
import $ from './ASTDisplay.module.scss'
import classNames from 'classnames'
import { Key } from 'rc-tree/lib/interface'
import { nodeLabel } from './utils'


function toASTData(node: Node): NonNullable<TreeProps['treeData']>[number] {
  return {
    key: node.id,
    title: nodeLabel(node),
    children: node.children().map(toASTData),
    icon: node.match({
      Environment(){ return <EnvironmentIcon className={classNames($.icon, $.iconPackage)} /> },
      Class(){ return <ModuleIcon className={classNames($.icon, $.iconClass)} /> },
      Mixin(){ return <ModuleIcon className={classNames($.icon, $.iconMixin)} /> },
      Singleton(){ return <ModuleIcon className={classNames($.icon, $.iconSingleton)} /> },
      Package(){ return <PackageIcon className={classNames($.icon, $.iconPackage)} /> },
      Body(){ return <PackageIcon className={classNames($.icon, $.iconBody)} /> },
      Describe(){ return <PackageIcon className={classNames($.icon, $.iconDescribe)} /> },
      Test(){ return <TestIcon className={classNames($.icon, $.iconTest)} /> },
      Method(){ return <MethodIcon className={classNames($.icon, $.iconMethod)} /> },
      Field(){ return <FieldIcon className={classNames($.icon, $.iconField)} /> },
      Sentence(){ return <SentenceIcon className={classNames($.icon, $.iconSentence)} /> },
      Node(){ return <ItemIcon className={classNames($.icon, $.iconItem)} /> },
    }),
  }
}

const switcherIcon = ({ expanded, isLeaf }: TreeNodeProps) => isLeaf ? undefined : expanded ? <SwitcherExpandedIcon/> : <SwitcherCollapsedIcon/>


const ASTDisplay = () => {
  const { interpreter } = useContext(DebuggerContext)
  const [expanded, setExpanded] = useState<Key[]>([])

  return (
    <Tree
      onExpand={setExpanded}
      expandedKeys={[...expanded, ...interpreter.evaluation.currentNode.ancestors().map(({ id }) => id)]}
      selectedKeys={[interpreter.evaluation.currentNode.id]}
      treeData={[toASTData(interpreter.evaluation.environment)]}
      switcherIcon={switcherIcon}
    />
  )
}

export default ASTDisplay