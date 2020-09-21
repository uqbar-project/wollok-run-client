import p5 from 'p5'
import p5Types from 'p5'
import React from 'react'
import Sketch from 'react-p5'
import 'p5/lib/addons/p5.sound'
import { Evaluation, interpret, WRENatives } from 'wollok-ts'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './Game'
import { Board, boardToLayers } from './utils'
import { flushEvents, emptyBoard, currentVisualStates, boardGround, cellSize, width, height, currentSoundStates, SoundState, io } from './GameStates'


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
    updateSounds()
    playSounds()
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

  function updateSounds() {

  }

  function updateBoard() {
    const current = JSON.stringify(board)
    const next = emptyBoard(evaluation)
    for (const { position: { x, y }, image, message } of currentVisualStates(evaluation)) {
      next[y] && next[y][x] && next[y][x].push({ img: `${image}`, message })
    }
    if (JSON.stringify(next) !== current) board = next
  }

  function drawBoardGround(sketch: p5) {
    const boardGroundPath = boardGround(evaluation)

    boardGroundPath && sketch.image(imageFromPath(boardGroundPath), 0, 0, sketch.width, sketch.height)
  }

  const playedSounds: string[] = []

  function playSounds() {
    currentSoundStates(evaluation).forEach((soundState: SoundState) => {
      if (soundState.status === "played" && !playedSounds.includes(soundState.id)) {
        const sound = new p5.SoundFile(game.assetsDir + soundState.file, () => { sound.play() })
        playedSounds.push(soundState.id)
      }
    })
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