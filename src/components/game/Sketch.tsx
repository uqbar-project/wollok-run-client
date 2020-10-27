import p5 from 'p5'
import p5Types from 'p5'
import React from 'react'
import Sketch from 'react-p5'
import 'p5/lib/addons/p5.sound'
import { Evaluation, interpret, WRENatives, Id } from 'wollok-ts'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './gameProject'
import { Board, boardToLayers } from './utils'
import { flushEvents, boardGround, cellSize, width, height, currentSoundStates, SoundState, io, nextBoard } from './GameStates'

const defaultImgs = [
  'ground.png',
  'wko.png',
  'speech.png',
  'speech2.png',
  'speech3.png',
  'speech4.png',
]

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
    syncSounds()
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
    defaultImgs.forEach((path: string) => {
      imgs[path] = sketch.loadImage(DEFAULT_GAME_ASSETS_DIR + path)
    })
    game.images.forEach(({ path, imageUrl }) => {
      imgs[path] = sketch.loadImage(imageUrl)
    })
  }

  function imageFromPath(path: string): p5.Image {
    return imgs[path] ?? imgs['wko.png']
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

  interface GameSound {
    lastSoundState: SoundState
    soundFile: p5.SoundFile
    started: boolean
    toBePlayed: boolean
  }

  const loadedSounds: Map<Id, GameSound> = new Map()

  function soundCanBePlayed(loadedSound: GameSound, currentSoundState: SoundState): boolean {
    return (loadedSound.lastSoundState.status !== currentSoundState.status || !loadedSound.started) && loadedSound.soundFile.isLoaded()
  }

  function playSounds() {
    [...loadedSounds.values()].filter((sound: GameSound) => sound.toBePlayed).forEach((sound: GameSound) => {
      sound.started = true

      switch (sound.lastSoundState.status) {
        case 'played': {
          sound.soundFile.play()
          break
        }
        case 'paused': {
          sound.soundFile.pause()
          break
        }
        case 'stopped': {
          sound.soundFile.stop()
        }
      }
    })
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
      loadedSound.soundFile.setLoop(soundState.loop)
      loadedSound.soundFile.setVolume(soundState.volume)
      loadedSound.toBePlayed = soundCanBePlayed(loadedSound, soundState)
      loadedSound.lastSoundState = soundState
    })
  }

  function getSoundPathFromFileName(fileName: string): string | undefined {
    return 'asd'
    //return game.soundPaths.find((soundPath: string) => soundPath.endsWith(fileName))
  }

  function addSoundFromSoundState(soundState: SoundState) {
    loadedSounds.set(soundState.id,
      {
        lastSoundState: soundState,
        soundFile: new p5.SoundFile(getSoundPathFromFileName(soundState.file)!), //TODO add soundfile not found exception
        started: false,
        toBePlayed: false,
      })
  }

  function removeUnusedLoadedSounds() {
    const soundIdsBeingUsed: Id[] = currentSoundStates(evaluation).map((soundState: SoundState) => soundState.id)
    const unusedSoundIds: Id[] = [...loadedSounds.keys()].filter((id: Id) => !soundIdsBeingUsed.includes(id))
    unusedSoundIds.forEach((unusedId: Id) => {
      loadedSounds.get(unusedId)?.soundFile.stop()
      loadedSounds.delete(unusedId)
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