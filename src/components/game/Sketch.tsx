/* eslint-disable no-console */
import p5 from 'p5'
import React, { useContext, useEffect, useState } from 'react'
import Sketch from 'react-p5'
import 'p5/lib/addons/p5.sound'
import { Evaluation, Id } from 'wollok-ts'
import { Interpreter } from 'wollok-ts/dist/interpreter/interpreter'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './gameProject'
import { GameSound, SoundState, SoundStatus } from './GameSound'
import { DrawableMessage, drawMessage } from './messages'
import { buildKeyPressEvent, visualState, flushEvents, canvasResolution, queueEvent, hexaToColor, baseDrawable, draw, moveAllTo, write, resizeCanvas } from './SketchUtils'
import Menu from '../Menu'
import { SketchContext } from '../../context/SketchContext'

const { round } = Math

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
  gameProject: GameProject
  evaluation: Evaluation
  exit: () => void
}

interface StepAssets {
  sketch: p5
  gameProject: GameProject
  interpreter: Interpreter
  sounds: Map<Id, GameSound>
  images: Map<Id, p5.Image>
  audioMuted: boolean
  gamePaused: boolean
}

interface SoundAssets {
  gameProject: GameProject
  interpreter: Interpreter
  sounds: Map<Id, GameSound>
  audioMuted?: boolean
  gamePaused?: boolean
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// GAME CYCLE
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

function step(assets: StepAssets) {
  const { sketch, gameProject, interpreter, sounds, images, audioMuted, gamePaused } = assets

  if(!gamePaused) {
    window.performance.mark('update-start')
    flushEvents(interpreter, sketch.millis())
    updateSound({ gameProject, interpreter, sounds, audioMuted })
    window.performance.mark('update-end')
    window.performance.mark('draw-start')
    render(interpreter, sketch, images)
    window.performance.mark('draw-end')

    window.performance.measure('update-start-to-end', 'update-start', 'update-end')
    window.performance.measure('draw-start-to-end', 'draw-start', 'draw-end')
  }
  else {
    updateSound({ gameProject, interpreter, sounds, gamePaused })
  }
  return undefined
}

function updateSound(assets: SoundAssets) {
  const { gameProject, interpreter, sounds, audioMuted, gamePaused } = assets
  const soundInstances = gamePaused ? [] : interpreter.object('wollok.game.game').get('sounds')?.innerCollection ?? []

  for (const [id, sound] of sounds.entries()) {
    if (!soundInstances.some(sound => sound.id === id)) {
      sound.stopSound()
      sounds.delete(id)
    } else {
      sound.playSound()
    }
  }

  soundInstances.forEach(soundInstance => {
    const soundState: SoundState = {
      id: soundInstance.id,
      file: soundInstance.get('file')!.innerString!,
      status: soundInstance.get('status')!.innerString! as SoundStatus,
      volume: audioMuted ? 0 : soundInstance.get('volume')!.innerNumber!,
      loop: soundInstance.get('loop')!.innerBoolean!,
    }

    let sound = sounds.get(soundState.id)
    if (!sound) {
      const soundPath = gameProject.sounds.find(({ possiblePaths }) => possiblePaths.includes(soundState.file))?.url
      if (soundPath) { // TODO: add soundfile not found exception
        sound = new GameSound(soundState, soundPath)
        sounds.set(soundState.id, sound)
      }
    }

    sound?.update(soundState)
  })
}

function render(interpreter: Interpreter, sketch: p5, images: Map<string, p5.Image>) {
  const game = interpreter.object('wollok.game.game')
  const cellPixelSize = game.get('cellSize')!.innerNumber!
  const boardGroundPath = game.get('boardGround')?.innerString

  if (boardGroundPath) sketch.image(baseDrawable(images, boardGroundPath).drawableImage!.image, 0, 0, sketch.width, sketch.height)
  else {
    const groundImage = baseDrawable(images, game.get('ground')!.innerString!).drawableImage!.image
    const gameWidth = round(game.get('width')!.innerNumber!)
    const gameHeight = round(game.get('height')!.innerNumber!)

    for (let x = 0; x < gameWidth; x++)
      for (let y = 0; y < gameHeight; y++)
        sketch.image(groundImage, x * cellPixelSize, y * cellPixelSize, cellPixelSize, cellPixelSize)
  }

  const messagesToDraw: DrawableMessage[] = []
  for (const visual of game.get('visuals')?.innerCollection ?? []) {
    const { image: stateImage, position, message, text, textColor } = visualState(interpreter, visual)
    const drawable = stateImage === undefined ? {} : baseDrawable(images, stateImage)
    let x = position.x * cellPixelSize
    let y = sketch.height - (position.y + 1) * cellPixelSize

    if (stateImage) {
      x = position.x * cellPixelSize
      y = sketch.height - position.y * cellPixelSize - drawable.drawableImage!.image.height
      moveAllTo(drawable, { x, y })
    }

    if (message && visual.get('messageTime')!.innerNumber! > sketch.millis())
      messagesToDraw.push({ message, x, y })

    draw(sketch, drawable)

    if (text) {
      x = (position.x + 0.5) * cellPixelSize
      y = sketch.height - (position.y + 0.5) * cellPixelSize
      const drawableText = { text, position: { x, y }, color: hexaToColor(textColor) }
      write(sketch, drawableText)
    }
  }

  messagesToDraw.forEach(drawMessage(sketch))


}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const SketchComponent = ({ gameProject, evaluation: initialEvaluation, exit }: SketchProps) => {
  const [stop, setStop] = useState(false)
  const images = new Map<string, p5.Image>()
  const sounds = new Map<Id, GameSound>()
  let interpreter = new Interpreter(initialEvaluation.copy())
  const { menuSize, gamePaused, audioMuted, setAudioMuted } = useContext(SketchContext)

  useEffect(() => {
    setInterval(() => {
      const measures = performance.getEntriesByType('measure')
      performance.clearMeasures()

      function inform(measureName: string) {
        const selectedMeasures = measures.filter(measure => measure.name === measureName)
        const totalTime = selectedMeasures.reduce((sum, measure) => sum + measure.duration, 0)
        const averageDuration = selectedMeasures.length ? totalTime / selectedMeasures.length : 0
        const durationPercentage = totalTime * 100 / 1000
        return `${Math.round(averageDuration)}ms (${durationPercentage.toFixed(2)}%)`
      }

      const instances = interpreter.evaluation.allInstances()
      console.log(`
        FPS: ${measures.filter(measure => measure.name === 'draw-start-to-end').length}
        Average Draw Time: ${inform('draw-start-to-end')}
        Average Update Time: ${inform('update-start-to-end')}
        Average Key Time: ${inform('key-start-to-end')}
        Instances: ${instances.size}
      `)
    }, 1000)
  }, [interpreter])

  function setup(sketch: p5, canvasParentRef: Element) {
    const { width, height } = canvasResolution(interpreter)
    sketch.createCanvas(width, height).parent(canvasParentRef)

    defaultImgs.forEach(path => images.set(path, sketch.loadImage(DEFAULT_GAME_ASSETS_DIR + path)))

    gameProject.images.forEach(({ possiblePaths, url }) =>
      possiblePaths.forEach(path =>
        images.set(path, sketch.loadImage(url))
      )
    )
    resizeCanvas(width, height, menuSize)
  }

  function draw(sketch: p5) {
    if (!interpreter.object('wollok.game.game').get('running')!.innerBoolean!) setStop(true)
    else step({ sketch, gameProject, interpreter, sounds, images, audioMuted, gamePaused })
  }

  function keyPressed(sketch: p5) {
    if(!gamePaused) {
      window.performance.mark('key-start')
      queueEvent(interpreter, buildKeyPressEvent(interpreter, wKeyCode(sketch.key, sketch.keyCode)), buildKeyPressEvent(interpreter, 'ANY'))
      window.performance.mark('key-end')
      window.performance.measure('key-start-to-end', 'key-start', 'key-end')
    }

    return false
  }

  function restart() {
    interpreter = new Interpreter(initialEvaluation.copy())
  }

  function pauseAndExit() {
    setAudioMuted(true)
    updateSound({ gameProject, interpreter, sounds, audioMuted })
    exit()
  }

  return <div>
    <Menu
      restart={restart}
      exit={pauseAndExit}
      gameDescription={gameProject.description}
    />
    <div>
      {stop
        ? <h1>Se terminó el juego</h1>
        : <Sketch setup={setup} draw={draw} keyPressed={keyPressed} />}
    </div>
  </div>
}

export default SketchComponent