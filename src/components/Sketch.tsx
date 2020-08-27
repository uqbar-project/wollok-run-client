import p5 from 'p5'
import React from 'react'
import Sketch from 'react-p5'
// import 'p5/lib/addons/p5.sound'
import { Evaluation, Id, interpret, WRENatives } from 'wollok-ts'
import { RuntimeObject } from 'wollok-ts/dist/interpreter'

type Cell = {
  img: string
  message?: any
}
type Board = Cell[][][]

const CELL_SIZE = 50

const io = (evaluation: Evaluation) => evaluation.environment.getNodeByFQN('wollok.io.io').id

export const gameInstance = (evaluation: Evaluation): RuntimeObject => {
  return evaluation.instance(evaluation.environment.getNodeByFQN('wollok.game.game').id)
}

const emptyBoard = (evaluation: Evaluation): Board => {
  const gameInst = gameInstance(evaluation)
  const width = evaluation.instance(gameInst.get('width')!.id).innerValue
  const height = evaluation.instance(gameInst.get('height')!.id).innerValue
  const ground = evaluation.instance(gameInst.get('ground')!.id) &&
    `${evaluation.instance(gameInst.get('ground')!.id).innerValue}`
  return Array.from(Array(height), () =>
    Array.from(Array(width), () => ground ? [{ img: ground }] : [])
  )
}

const flushEvents = (evaluation: Evaluation, ms: number): void => {
  const { sendMessage } = interpret(evaluation.environment, WRENatives)
  const time = evaluation.createInstance('wollok.lang.Number', ms)
  sendMessage('flushEvents', io(evaluation), time)(evaluation)
}

function wKeyCode(key: string, keyCode: number) {
  if (keyCode >= 48 && keyCode <= 57) return `Digit${key}`
  if (keyCode >= 65 && keyCode <= 90) return `Key${key.toUpperCase()}`
  if (keyCode === 18) return 'AltLeft'
  if (keyCode === 225) return 'AltRight'
  if (keyCode === 8) return 'Backspace'
  if (keyCode === 17) return 'Control'
  if (keyCode === 46) return 'Delete'
  if (keyCode >= 37 && keyCode <= 40) return key
  if (keyCode === 13) return 'Enter'
  if (keyCode === 189) return 'Minus'
  if (keyCode === 187) return 'Plus'
  if (keyCode === 191) return 'Slash'
  if (keyCode === 32) return 'Space'
  if (keyCode === 16) return 'Shift'
  return undefined
}

// interface VisualState {
//   position: {
//     x: any,
//     y: any
//   },
//   image: any,
//   message?: any
// }

const currentVisualStates = (evaluation: Evaluation) => {
  const { sendMessage } = interpret(evaluation.environment, WRENatives)

  const wVisuals: RuntimeObject = evaluation.instance(gameInstance(evaluation).get('visuals')!.id)
  wVisuals.assertIsCollection()
  const visuals = wVisuals.innerValue
  return visuals.map((id: Id) => {
    const currentFrame = evaluation.currentFrame()!

    sendMessage('position', id)(evaluation)
    const position = evaluation.instance(currentFrame.operandStack.pop()!)
    const wx: RuntimeObject = evaluation.instance(position.get('x')!.id)
    wx.assertIsNumber()
    const x = wx.innerValue
    const wy: RuntimeObject = evaluation.instance(position.get('y')!.id)
    wy.assertIsNumber()
    const y = wy.innerValue

    sendMessage('image', id)(evaluation)
    const wImage: RuntimeObject = evaluation.instance(currentFrame.operandStack.pop()!)
    wImage.assertIsString()
    const image = wImage.innerValue
    const actor = evaluation.instance(id)
    const wMessage: RuntimeObject | undefined = actor.get('message')
    const wMessageTime: RuntimeObject | undefined = actor.get('messageTime')
    // wMessage?.assertIsString()
    const text = wMessage ? wMessage.innerValue : undefined
    const message = text ? { text, time: wMessageTime ? wMessageTime.innerValue : undefined } : undefined
    return { position: { x, y }, image, message }
  })

}

interface SketchProps {
  game: {
    imagePaths: string[]
    cwd: string
  }
  evaluation: Evaluation
}

const SketchComponent = ({ game: { imagePaths, cwd }, evaluation }: SketchProps) => {
  const imgs: { [id: string]: p5.Image } = {}
  let board: Board

  function loadImages(sketch: p5) {
    imagePaths.forEach((path: string) => {
      imgs[path] = sketch.loadImage(`${cwd}/assets/${path}`)
    })
  }

  function updateBoard() {
    const current = JSON.stringify(board)
    const next = emptyBoard(evaluation)
    for (const { position: { x, y }, image, message } of currentVisualStates(evaluation)) {
      next[y][x].push({ img: `${image}`, message })
    }
    if (JSON.stringify(next) !== current) board = next
  }

  function drawBoard(sketch: p5) { // TODO: Draw by layer, not cell
    board.forEach((row, _y) => {
      const y = sketch.height - _y * CELL_SIZE
      row.forEach((cell, _x) => {
        const x = _x * CELL_SIZE
        cell.forEach(({ img, message }) => {
          const imageObject = imgs[img]
          const yPosition = y - imageObject.height
          sketch.image(imageObject, x, yPosition)
          if (message && message.time > currentTime(sketch)) sketch.text(message.text, x, yPosition)
        })
      })
    })
  }

  function currentTime(sketch: p5) { return sketch.millis() }


  function draw(sketch: p5) {
    if (!evaluation) return
    flushEvents(evaluation, currentTime(sketch))
    updateBoard()
    drawBoard(sketch)
  }

  function setup(sketch: p5, canvasParentRef: any) {
    sketch.createCanvas(500, 500).parent(canvasParentRef)
    loadImages(sketch)
  }

  function keyPressed(sketch: p5) {
    const left = evaluation.createInstance('wollok.lang.String', 'keydown')
    const right = evaluation.createInstance('wollok.lang.String', wKeyCode(sketch.key, sketch.keyCode))
    const id = evaluation.createInstance('wollok.lang.List', [left, right])
    const { sendMessage } = interpret(evaluation.environment, WRENatives)
    sendMessage('queueEvent', io(evaluation), id)(evaluation)
    return false
  }

  return <Sketch setup={setup as any} draw={draw as any} keyPressed={keyPressed as any} />
}

export default SketchComponent