import p5 from 'p5'
import p5Types from 'p5'
import React from 'react'
import Sketch from 'react-p5'
import { Evaluation, interpret, WRENatives, Id } from 'wollok-ts'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './Game'
import { Board, boardToLayers } from './utils'
import { flushEvents, boardGround, cellSize, currentSoundStates, SoundState, io, nextBoard, canvasResolution } from './GameStates'
import { GameSound } from './GameSound'

export function wKeyCode(keyName: string, keyCode: number): string { //These keyCodes correspond to http://keycode.info/
  if (keyCode >= 48 && keyCode <= 57) return `Digit${keyName}` //Numbers (non numpad)
  if (keyCode >= 65 && keyCode <= 90) return `Key${keyName.toUpperCase()}` //Letters
  if (keyCode === 18) return 'AltLeft'
  if (keyCode === 225) return 'AltRight'
  if (keyCode === 8) return 'Backspace'
  if (keyCode === 17) return 'Control'
  if (keyCode === 46) return 'Delete'
  if (keyCode >= 37 && keyCode <= 40) return keyName //Arrows
  if (keyCode === 13) return 'Enter'
  if (keyCode === 189) return 'Minus'
  if (keyCode === 187) return 'Plus'
  if (keyCode === 191) return 'Slash'
  if (keyCode === 32) return 'Space'
  if (keyCode === 16) return 'Shift'
  return '' //If an unknown key is pressed, a string should be returned
}

export function buildKeyPressEvent(evaluation: Evaluation, keyCode: string): Id {
  const eventType = evaluation.createInstance('wollok.lang.String', 'keypress')
  const wKey = evaluation.createInstance('wollok.lang.String', keyCode)
  return evaluation.createInstance('wollok.lang.List', [eventType, wKey])
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
    syncSounds()
    playSounds()
    drawBoard(sketch)
  }

  const setup = (sketch: p5Types, canvasParentRef: any) => {
    const resolution = canvasResolution(evaluation)

    sketch.createCanvas(resolution.x, resolution.y).parent(canvasParentRef)
    loadImages(sketch)
  }

  function loadImages(sketch: p5Types) {
    game.imagePaths.forEach((gamePath: string) => {
      imgs[gamePath] = sketch.loadImage(gamePath)
    })
  }

  function imageFromPath(path: string): p5.Image { //TODO hacer otra funcion que reciba game e imgs, y devuelva esto, para testear
    const possibleImage: p5.Image | undefined = game.sourcePaths.map((sourcePath: string) => imgs[`${sourcePath}/${path}`]).find((image: p5.Image | undefined) => image)
    return possibleImage ?? imgs[DEFAULT_GAME_ASSETS_DIR + path] ?? imgs[DEFAULT_GAME_ASSETS_DIR + 'wko.png']
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

  const loadedSounds: Map<Id, GameSound> = new Map()

  function playSounds() {
    [...loadedSounds.values()].forEach((sound: GameSound) => sound.playSound())
  }

  function syncSounds() {
    removeUnusedLoadedSounds()
    updateSounds()
  }

  function updateSounds() {
    currentSoundStates(evaluation).forEach((soundState: SoundState) => {
      if (!loadedSounds.has(soundState.id)) {
        addSoundFromSoundState(soundState)
      }

      const loadedSound: GameSound = loadedSounds.get(soundState.id)!
      loadedSound.update(soundState)
    })
  }

  function getSoundPathFromFileName(fileName: string): string | undefined {
    return game.soundPaths.find((soundPath: string) => soundPath.endsWith(fileName))
  }

  function addSoundFromSoundState(soundState: SoundState) {
    loadedSounds.set(soundState.id, new GameSound(soundState, getSoundPathFromFileName(soundState.file)!)) //TODO add soundfile not found exception
  }

  function removeUnusedLoadedSounds() {
    const soundIdsBeingUsed: Id[] = currentSoundStates(evaluation).map((soundState: SoundState) => soundState.id)
    const unusedSoundIds: Id[] = [...loadedSounds.keys()].filter((id: Id) => !soundIdsBeingUsed.includes(id))
    unusedSoundIds.forEach((unusedId: Id) => {
      loadedSounds.get(unusedId)?.stopSound()
      loadedSounds.delete(unusedId)
    })
  }

  function drawBoard(sketch: p5) { //TODO lo mismo de sacar cosas intermedias
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
    const keyPressedEvent = buildKeyPressEvent(evaluation, wKeyCode(sketch.key, sketch.keyCode))
    const anyKeyPressedEvent = buildKeyPressEvent(evaluation, 'ANY')

    queueGameEvent(keyPressedEvent)
    queueGameEvent(anyKeyPressedEvent)
    return false
  }

  return <Sketch setup={setup as any} draw={draw as any} keyPressed={keyPressed as any} />
}

export default SketchComponent