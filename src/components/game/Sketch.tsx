import p5 from 'p5'
import p5Types from 'p5'
import React from 'react'
import Sketch from 'react-p5'
// import 'p5/lib/addons/p5.sound'
import { Evaluation, Id, interpret } from 'wollok-ts/dist'
import { Natives, RuntimeObject } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { GameProject } from './Game'

const natives = wre as Natives

type Cell = { img: string, message?: any }
type Board = Cell[][][]

const io = (evaluation: Evaluation) => evaluation.environment.getNodeByFQN('wollok.io.io').id

export const gameInstance = (evaluation: Evaluation) => {
  return evaluation.instance(evaluation.environment.getNodeByFQN('wollok.game.game').id)
}

function gameInstanceField(evaluation: Evaluation, field: string): RuntimeObject {
  const gameInst: RuntimeObject = gameInstance(evaluation)
  return evaluation.instance(gameInst.get(field)!.id)
}

const emptyBoard = (evaluation: Evaluation): Board => {
  const width = gameInstanceField(evaluation, 'width').innerValue
  const height = gameInstanceField(evaluation, 'height').innerValue
  const ground = gameInstanceField(evaluation, 'ground') &&
    `${gameInstanceField(evaluation, 'ground').innerValue}`
  return Array.from(Array(height), () =>
    Array.from(Array(width), () => ground ? [{ img: ground }] : [])
  )
}

const flushEvents = (evaluation: Evaluation, ms: number): void => {
  const { sendMessage } = interpret(evaluation.environment, natives)
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
  const { sendMessage } = interpret(evaluation.environment, natives)

  const wVisuals: RuntimeObject = gameInstanceField(evaluation, 'visuals')
  wVisuals.assertIsCollection()
  const visuals = wVisuals.innerValue
  return visuals.map((id: Id) => {
    const currentFrame = evaluation.currentFrame()!
    let position = evaluation.instance(id).get('position')
    if (!position) {
      sendMessage('position', id)(evaluation)
      position = evaluation.instance(currentFrame.operandStack.pop()!)
    }
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
  game: GameProject
  evaluation: Evaluation
}

export default ({ game, evaluation }: SketchProps) => {
  const imgs: { [id: string]: p5.Image } = {}
  let board: Board


  const draw = (sketch: p5Types) => {
    if (!evaluation) return
    flushEvents(evaluation, currentTime(sketch))
    updateBoard()
    drawBoard(sketch)
  }

  const canvasResolution = () => {
    const widthInst: RuntimeObject = gameInstanceField(evaluation, 'width')
    const heightInst: RuntimeObject = gameInstanceField(evaluation, 'height')
    const cellSizeInst: RuntimeObject = gameInstanceField(evaluation, 'cellSize')
    widthInst.assertIsNumber()
    heightInst.assertIsNumber()
    cellSizeInst.assertIsNumber()

    const pixelWidth = widthInst.innerValue * cellSizeInst.innerValue
    const pixelHeight = heightInst.innerValue * cellSizeInst.innerValue

    return {
      x: pixelWidth,
      y: pixelHeight,
    }
  }

  const setup = (sketch: p5Types, canvasParentRef: any) => {
    const resolution = canvasResolution()

    sketch.createCanvas(resolution.x, resolution.y).parent(canvasParentRef)
    loadImages(sketch)
  }

  function loadImages(sketch: p5Types) {
    game.imagePaths.forEach((path: string) => {
      imgs[path.split('/').pop()!] = sketch.loadImage(game.assetSource + path)
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
    const cellSizeInst: RuntimeObject = gameInstanceField(evaluation, 'cellSize')
    cellSizeInst.assertIsNumber()
    const cellSize = cellSizeInst.innerValue

    board.forEach((row, _y) => {
      const y = sketch.height - _y * cellSize
      row.forEach((cell, _x) => {
        const x = _x * cellSize
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

  function keyPressed(sketch: p5) {
    const left = evaluation.createInstance('wollok.lang.String', 'keydown')
    const right = evaluation.createInstance('wollok.lang.String', wKeyCode(sketch.key, sketch.keyCode))
    const id = evaluation.createInstance('wollok.lang.List', [left, right])
    const { sendMessage } = interpret(evaluation.environment, natives)
    sendMessage('queueEvent', io(evaluation), id)(evaluation)
    return false
  }

  return <Sketch setup={setup as any} draw={draw as any} keyPressed={keyPressed as any} />
}
