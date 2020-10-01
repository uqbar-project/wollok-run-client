import p5 from 'p5'
import p5Types from 'p5'
import React from 'react'
import Sketch from 'react-p5'
// import 'p5/lib/addons/p5.sound'
import { Evaluation, Id, interpret, WRENatives } from 'wollok-ts'
import { RuntimeObject } from 'wollok-ts/dist/interpreter'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './Game'
import { Board, boardToLayers } from './utils'

const io = (evaluation: Evaluation) => evaluation.environment.getNodeByFQN('wollok.io.io').id

export const gameInstance = (evaluation: Evaluation): RuntimeObject => {
  return evaluation.instance(evaluation.environment.getNodeByFQN('wollok.game.game').id)
}

function gameInstanceField(evaluation: Evaluation, field: string): RuntimeObject | undefined {
  const gameField: RuntimeObject | undefined = gameInstance(evaluation).get(field)
  return gameField && evaluation.instance(gameField.id)
}

function numberGameFieldValue(evaluation: Evaluation, field: string): number {
  const fieldInst: RuntimeObject = gameInstanceField(evaluation, field)!
  fieldInst.assertIsNumber()
  return fieldInst.innerValue
}

function stringGameFieldValue(evaluation: Evaluation, field: string): string {
  const fieldInst: RuntimeObject = gameInstanceField(evaluation, field)!
  fieldInst.assertIsString()
  return fieldInst.innerValue
}

function width(evaluation: Evaluation): number {
  return numberGameFieldValue(evaluation, 'width')
}

function height(evaluation: Evaluation): number {
  return numberGameFieldValue(evaluation, 'height')
}

function cellSize(evaluation: Evaluation): number {
  return numberGameFieldValue(evaluation, 'cellSize')
}

function ground(evaluation: Evaluation): string {
  return stringGameFieldValue(evaluation, 'ground')
}

function boardGround(evaluation: Evaluation): string | undefined {
  return gameInstanceField(evaluation, 'boardGround') && stringGameFieldValue(evaluation, 'boardGround')
}

const emptyBoard = (evaluation: Evaluation): Board => {
  const groundPath = ground(evaluation)
  const boardgroundPath = boardGround(evaluation)
  return Array.from(Array(height(evaluation)), () =>
    Array.from(Array(width(evaluation)), () => !boardgroundPath ? [{ img: groundPath }] : [])
  )
}

export const nextBoard = (evaluation: Evaluation): Board => {
  const next = emptyBoard(evaluation)
  for (const { position: { x, y }, image, message } of currentVisualStates(evaluation)) {
    next[y] && next[y][x] && next[y][x].push({ img: `${image}`, message })
  }
  return next
}

const flushEvents = (evaluation: Evaluation, ms: number): void => {
  const { sendMessage } = interpret(evaluation.environment, WRENatives)
  const time = evaluation.createInstance('wollok.lang.Number', ms)
  sendMessage('flushEvents', io(evaluation), time)(evaluation)
}

function wKeyCode(key: string, keyCode: number): string {
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
  return '' //If an unknown key is pressed, a string should be returned
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

  const wVisuals: RuntimeObject = gameInstanceField(evaluation, 'visuals')!
  wVisuals.assertIsCollection()
  const visuals = wVisuals.innerValue
  return visuals.map((id: Id) => {
    const currentFrame = evaluation.currentFrame()!
    const visual = evaluation.instance(id)
    let position = visual.get('position')
    if (!position) {
      sendMessage('position', id)(evaluation)
      position = evaluation.instance(currentFrame.operandStack.pop()!)
    }
    const wx: RuntimeObject = evaluation.instance(position.get('x')!.id)
    wx.assertIsNumber()
    const x = Math.trunc(wx.innerValue)
    const wy: RuntimeObject = evaluation.instance(position.get('y')!.id)
    wy.assertIsNumber()
    const y = Math.trunc(wy.innerValue)

    let image
    if (visual.module().lookupMethod('image', 0)) {
      sendMessage('image', id)(evaluation)
      const wImage: RuntimeObject = evaluation.instance(currentFrame.operandStack.pop()!)
      wImage.assertIsString()
      image = wImage.innerValue
    } else {
      image = 'wko.png'
    }
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

const SketchComponent = ({ game, evaluation }: SketchProps) => {
  const imgs: { [id: string]: p5.Image } = {}
  let board: Board


  const draw = (sketch: p5Types) => {
    flushEvents(evaluation, currentTime(sketch))
    updateBoard()
    drawBoard(sketch)
  }

  const canvasResolution = () => {
    const cellPixelSize = cellSize(evaluation)

    const pixelWidth = width(evaluation) * cellPixelSize
    const pixelHeight = height(evaluation) * cellPixelSize

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
    game.imagePaths.forEach((gamePath: string) => {
      imgs[gamePath] = sketch.loadImage(gamePath)
    })
  }

  function imageFromPath(path: string): p5.Image {
    return imgs[game.assetsDir + path] ?? imgs[DEFAULT_GAME_ASSETS_DIR + path] ?? imgs[DEFAULT_GAME_ASSETS_DIR + 'wko.png']
  }

  function updateBoard() {
    const current = JSON.stringify(board)
    const next = nextBoard(evaluation)
    if (JSON.stringify(next) !== current) board = next
  }

  function drawBoardGround(sketch: p5) {
    const boardGroundPath = boardGround(evaluation)

    boardGroundPath && sketch.image(imageFromPath(boardGroundPath), 0, 0, sketch.width, sketch.height)
  }

  function drawBoard(sketch: p5) {
    const cellPixelSize = cellSize(evaluation)
    drawBoardGround(sketch)
    boardToLayers(board).forEach(layer => {
      layer.forEach((row, _y) => {
        if (!row) return
        const y = sketch.height - _y * cellPixelSize
        row.forEach((actor, _x) => {
          if (!actor) return
          const { img, message } = actor
          const x = _x * cellPixelSize
          const imageObject: p5.Image = imageFromPath(img)
          const yPosition = y - imageObject.height
          sketch.image(imageObject, x, yPosition)
          if (message && message.time > currentTime(sketch)) sketch.text(message.text, x, yPosition)
        })
      })
    })
  }

  function currentTime(sketch: p5) { return sketch.millis() }

  function queueGameEvent(eventId: string) {
    const { sendMessage } = interpret(evaluation.environment, WRENatives)
    sendMessage('queueEvent', io(evaluation), eventId)(evaluation)
  }

  function keyPressed(sketch: p5) {
    const left = evaluation.createInstance('wollok.lang.String', 'keypress')
    const keyPressedCode = evaluation.createInstance('wollok.lang.String', wKeyCode(sketch.key, sketch.keyCode))
    const anyKeyCode = evaluation.createInstance('wollok.lang.String', 'ANY')
    const keyPressedId = evaluation.createInstance('wollok.lang.List', [left, keyPressedCode])
    const anyKeyPressedId = evaluation.createInstance('wollok.lang.List', [left, anyKeyCode])

    queueGameEvent(keyPressedId)
    queueGameEvent(anyKeyPressedId)
    return false
  }

  return <Sketch setup={setup as any} draw={draw as any} keyPressed={keyPressed as any} />
}

export default SketchComponent