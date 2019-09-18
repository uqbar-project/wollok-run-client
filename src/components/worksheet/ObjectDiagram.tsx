import cytoscape, { ElementDefinition } from 'cytoscape'
import React, { memo, useEffect, useRef } from 'react'
import { Evaluation, Id, Module } from 'wollok-ts/dist/src'
import { NULL_ID, RuntimeObject } from 'wollok-ts/dist/src/interpreter'
import $ from './ObjectDiagram.module.scss'

const { values, keys } = Object


const NODE_STYLES = [
  {
    selector: 'edge',
    style: {
      'label': 'data(label)',
      'curve-style': 'bezier',
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle',
      'font-family': 'monospace',
      'font-size': 8,
    },
  },
  {
    selector: 'node',
    style: {
      'background-color': 'gray',
      'label': 'data(label)',
      'font-family': 'monospace',
    },
  },
  {
    selector: 'node[type = "object"]',
    style: {
      'background-color': 'blue',
    },
  },
  {
    selector: 'node[type = "literal"]',
    style: {
      'background-opacity': 0,
      'text-valign': 'center',
    },
  },
]

const cy = cytoscape({ style: NODE_STYLES, headless: true }).on('drag', (e) => {
  cy.on('layoutstart', () => e.target.lock())
  cy.on('layoutstop', () => e.target.unlock())
})

export type ObjectDiagramProps = {
  evaluation?: Evaluation
}

const ObjectDiagram = ({ evaluation }: ObjectDiagramProps) => {
  const ref = useRef(null)

  useEffect(() => {
    cy.mount(ref.current!)
  }, [])


  useEffect(() => {
    cy.elements().remove()

    if (!evaluation) return

    function decoration({ module, id, innerValue }: RuntimeObject): {} {
      if (id === NULL_ID || module === 'wollok.lang.Number') return {
        type: 'literal',
        label: `${innerValue}`,
      }

      if (module === 'wollok.lang.String') return {
        type: 'literal',
        label: `"${innerValue}"`,
      }

      const moduleNode = evaluation!.environment.getNodeByFQN<Module>(module)
      if (moduleNode.is('Singleton') && moduleNode.name) return {
        type: 'object',
        label: moduleNode.name,
      }

      return { label: `${module}#${id}` }
    }

    function elementFromObject(obj: RuntimeObject, alreadyVisited: Id[] = []): ElementDefinition[] {
      const { id, fields } = obj
      if (alreadyVisited.includes(id)) return []
      return [
        { data: { id, ...decoration(obj) } },
        ...keys(fields).flatMap(name => [
          { data: { id: `${id}_${fields[name]}`, label: name, source: id, target: fields[name] } },
          ...elementFromObject(evaluation!.instance(fields[name]), [...alreadyVisited, id]),
        ]),
      ]
    }

    const elements: ElementDefinition[] = values(evaluation.instances)
      .filter(({ module }) =>
        module !== 'main.repl' &&
        !module.startsWith('wollok') &&
        !!evaluation.environment.getNodeByFQN<Module>(module).name
      )
      .flatMap(obj => elementFromObject(obj))

    cy.add(elements)
    cy.layout({
      name: 'cose',
      animate: false,
      nodeDimensionsIncludeLabels: true,
    }).run()
  }, [evaluation])

  return <div className={$.diagram} ref={ref} />
}

export default memo(ObjectDiagram)