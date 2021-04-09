import React, { useContext } from 'react'
import { Node } from 'wollok-ts'
import { DebuggerContext } from './Debugger'
import Tree, { TreeProps, TreeNodeProps } from 'rc-tree'
import { VscSymbolOperator as SentenceIcon, VscTriangleRight as SwitcherCollapsedIcon, VscTriangleDown as SwitcherExpandedIcon, VscSymbolClass as EnvironmentIcon, VscSymbolInterface as ModuleIcon, VscSymbolNamespace as PackageIcon, VscCircleFilled as ItemIcon, VscBeaker as TestIcon, VscSymbolMethod as MethodIcon, VscSymbolField as FieldIcon } from 'react-icons/vsc'
import $ from './ASTDisplay.module.scss'
import classNames from 'classnames'


function toASTData(node: Node): NonNullable<TreeProps['treeData']>[number] {
  return {
    key: node.id,
    title: node.match({
      Literal: node => `${node.kind}<${typeof node.value}> ${node.value && typeof node.value === 'object' ? '{}' : node.value}`,
      Reference: node => `${node.kind}<${node.target().kind}> ${node.name}`,
      Send: node => `${node.kind} ${node.message}/${node.args.length}`,
      Entity: node => `${node.kind} ${node.name ?? ''}`,
      Node: node => `${node.kind}`,
    }),
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
  const { executionDirector } = useContext(DebuggerContext)

  return (
    <Tree
      defaultExpandedKeys={executionDirector.evaluation.currentNode.ancestors().map(({ id }) => id)}
      defaultSelectedKeys={[executionDirector.evaluation.currentNode.id]}
      treeData={[toASTData(executionDirector.evaluation.environment)]}
      switcherIcon={switcherIcon}
    />
  )
}

export default ASTDisplay