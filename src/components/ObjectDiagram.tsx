import cytoscape, { ElementDefinition } from 'cytoscape'
import React, { useEffect, useRef } from 'react'
import styles from './ObjectDiagram.module.scss'

const style = [
  {
    selector: 'node',
    style: {
      'background-color': 'gray',
      'label': 'data(id)',
    },
  },
  {
    selector: 'node[type = "object"]',
    style: {
      'background-color': 'green',
      'label': 'data(id)',
    },
  },
  {
    selector: 'node[type = "class"]',
    style: {
      'background-color': 'red',
      'shape': 'rectangle',
      'label': 'data(id)',
    },
  },

  {
    selector: 'edge',
    style: {
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'target-arrow-shape': 'triangle',
    },
  },
]

const cy = cytoscape({ style, headless: true })

cy.on('drag', (e) => {
  cy.on('layoutstart', () => e.target.lock())
  cy.on('layoutstop', () => e.target.unlock())
})

type Props = {
  elements: ElementDefinition[]
}

export default ({ elements }: Props) => {
  const ref = useRef(null)

  useEffect(() => {
    cy.mount(ref.current!)
  }, [])


  useEffect(() => {
    cy.add(elements)
    cy.layout({
      name: 'cose',
      animate: false,
    }).run()
  }, [elements])

  return <div className={styles.diagram} ref={ref} />
}