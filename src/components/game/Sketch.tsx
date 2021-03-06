import p5 from 'p5'
import p5Types from 'p5'
import React, { useState } from 'react'
import Sketch from 'react-p5'
import 'p5/lib/addons/p5.sound'
import { Evaluation, Id } from 'wollok-ts'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './gameProject'
import { flushEvents, boardGround, cellSize, currentSoundStates, SoundState, canvasResolution, gameStop, VisualMessage, ground, height, width, VisualState, currentVisualStates } from './GameStates'
import { GameSound } from './GameSound'
import { buildKeyPressEvent, queueGameEvent } from './SketchUtils'
import { Button } from '@material-ui/core'
import ReplayIcon from '@material-ui/icons/Replay'
import { DrawableMessage, drawMessage } from './messages'

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

const SketchComponent = ({ game, evaluation: e }: SketchProps) => {
  const [stop, setStop] = useState(false)
  const imgs: { [id: string]: p5.Image } = {}
  let evaluation = e.copy()

  const draw = (sketch: p5Types) => {
    flushEvents(evaluation, currentTime(sketch))
    checkStop()
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
    defaultImgs.forEach((path: string) => {
      imgs[path] = sketch.loadImage(DEFAULT_GAME_ASSETS_DIR + path)
    })
    game.images.forEach(({ possiblePaths, url }) => {
      const loadedImage = sketch.loadImage(url)
      possiblePaths.forEach((path: string) => imgs[path] = loadedImage)
    })
  }

  function imageFromPath(path: string): p5.Image {
    return imgs[path] ?? imgs['wko.png']
  }

  function drawFullBackgroundImage(sketch: p5) {
    sketch.image(imageFromPath(boardGround(evaluation)!), 0, 0, sketch.width, sketch.height)
  }

  function drawGroundBackground(sketch: p5) {
    const groundPath = ground(evaluation)
    const gameWidth = width(evaluation)
    const gameHeigth = height(evaluation)
    let x: number
    let y: number
    for (x = 0; x < gameWidth; x++) {
      for (y = 0; y < gameHeigth; y++) {
        const position = { x, y }
        drawVisual(sketch, { position, image: groundPath })
      }
    }
  }

  function drawBackground(sketch: p5) {
    const boardGroundPath = boardGround(evaluation)
    if (boardGroundPath)
      drawFullBackgroundImage(sketch)
    else
      drawGroundBackground(sketch)
  }

  function checkStop() {
    if (gameStop(evaluation)) {
      setStop(true)
    }
  }

  function restart() {
    evaluation = e.copy()
    setStop(false)
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

  function getSoundUrlFromFileName(fileName: string): string | undefined {
    return game.sounds.find(({ possiblePaths }) => possiblePaths.includes(fileName))?.url
  }

  function addSoundFromSoundState(soundState: SoundState) {
    loadedSounds.set(soundState.id, new GameSound(soundState, getSoundUrlFromFileName(soundState.file)!)) //TODO add soundfile not found exception
  }

  function removeUnusedLoadedSounds() {
    const soundIdsBeingUsed: Id[] = currentSoundStates(evaluation).map((soundState: SoundState) => soundState.id)
    const unusedSoundIds: Id[] = [...loadedSounds.keys()].filter((id: Id) => !soundIdsBeingUsed.includes(id))
    unusedSoundIds.forEach((unusedId: Id) => {
      loadedSounds.get(unusedId)?.stopSound()
      loadedSounds.delete(unusedId)
    })
  }

  function canvasPositionOfVisual(sketch: p5, visual: VisualState) {
    const cellPixelSize = cellSize(evaluation)
    const gamePosition = visual.position
    const y = sketch.height - gamePosition.y * cellPixelSize
    const xPosition = gamePosition.x * cellPixelSize
    const imageObject: p5.Image = imageFromPath(visual.image)
    const yPosition = y - imageObject.height
    return { x: xPosition, y: yPosition }
  }

  function drawVisual(sketch: p5, visual: VisualState) {
    const position = canvasPositionOfVisual(sketch, visual)
    sketch.image(imageFromPath(visual.image), position.x, position.y)
  }

  function drawBoard(sketch: p5) {
    const messagesToDraw: DrawableMessage[] = []
    drawBackground(sketch)
    currentVisualStates(evaluation).forEach(visual => {
      drawVisual(sketch, visual)
      const position = canvasPositionOfVisual(sketch, visual)
      const message: VisualMessage | undefined = visual.message
      if (message && message.time > currentTime(sketch)) messagesToDraw.push({ message: message.text, x: position.x, y: position.y })
    })
    messagesToDraw.forEach(drawMessage(sketch))
  }

  function currentTime(sketch: p5) { return sketch.millis() }

  function keyPressed(sketch: p5) {
    const keyPressedEvent = buildKeyPressEvent(evaluation, wKeyCode(sketch.key, sketch.keyCode))
    const anyKeyPressedEvent = buildKeyPressEvent(evaluation, 'ANY')

    queueGameEvent(evaluation, keyPressedEvent)
    queueGameEvent(evaluation, anyKeyPressedEvent)

    return false
  }

  return <div>
    {stop ?
      <h1>Se terminó el juego</h1>
      : <Sketch setup={setup as any} draw={draw as any} keyPressed={keyPressed as any} />}
    <RestartButton restart={restart} />
  </div>
}

export default SketchComponent

type RestartProps = { restart: () => void }
export function RestartButton(props: RestartProps) {
  return <Button onClick={event => { event.preventDefault(); props.restart() }} variant="contained" color="primary" startIcon={<ReplayIcon />}>Reiniciar el juego</Button>
}