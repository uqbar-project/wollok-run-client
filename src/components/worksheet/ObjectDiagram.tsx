import cytoscape, { ElementDefinition, Stylesheet } from 'cytoscape'
import React, { memo, useEffect, useRef } from 'react'
import { Evaluation, Id, RuntimeObject } from 'wollok-ts/dist'
import $ from './ObjectDiagram.module.scss'

const NODE_STYLES: Stylesheet[] = [
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
    style: { 'background-color': '#2e72d8' },
  },
  {
    selector: 'node[type = "literal"]',
    style: {
      'background-opacity': 0,
      'text-valign': 'center',
      'color': '#ff3bc3',
      'font-weight': 'bold',
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

    function decoration(obj: RuntimeObject) {
      const { id, innerValue, module } = obj
      const moduleName: string = module.fullyQualifiedName()

      if (obj === RuntimeObject.null(evaluation!) || moduleName === 'wollok.lang.Number') return {
        type: 'literal',
        label: `${innerValue}`,
      }

      if (moduleName === 'wollok.lang.String') return {
        type: 'literal',
        label: `"${innerValue}"`,
      }

      if (module.is('Singleton') && module.name) return {
        type: 'object',
        label: module.name,
      }

      return { label: `${module}#${id}` }
    }

    function elementFromObject(obj: RuntimeObject, alreadyVisited: Id[] = []): ElementDefinition[] {
      const { id } = obj
      if (alreadyVisited.includes(id)) return []
      return [
        { data: { id, ...decoration(obj) } },
        ...[...obj.locals.keys()].flatMap(name => [
          { data: { id: `${id}_${obj.get(name)?.id}`, label: name, source: id, target: obj.get(name)?.id } },
          ...elementFromObject(obj.get(name)!, [...alreadyVisited, id]),
        ]),
      ]
    }

    const elements: ElementDefinition[] = evaluation.instances
      .filter((obj) => {
        const name = obj.module.fullyQualifiedName()
        return name && name !== 'worksheet.main.repl' && !name.startsWith('wollok')
      })
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