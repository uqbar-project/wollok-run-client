import { Node } from 'wollok-ts'

export function nodeLabel(node: Node): string {
  return `[${node.kind}] ${node.match({
    Parameter: node => `${node.name}${node.isVarArg ? '...' : ''}`,
    Literal: node => `<${typeof node.value}> ${node.value && typeof node.value === 'object' ? '{}' : node.value}`,
    Reference: node => `<${node.target().kind}> ${node.name}`,
    Send: node => `${node.message}/${node.args.length}`,
    Entity: node => `${node.name ?? ''}`,
    Method: node => `${node.name}/${node.parameters.length}`,
    Field: node => `${node.name}`,
    Variable: node => `${node.name}`,
    Body: node => nodeLabel(node.parent()),
    Node: () => '',
  })}${node.isSynthetic() ? ' %synth%' : ''}`
}