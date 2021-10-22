/* eslint-disable no-console */
import p5 from 'p5'
import React, { useContext } from 'react'
import Sketch from 'react-p5'
import 'p5/lib/addons/p5.sound'
import { Evaluation, Id } from 'wollok-ts'
import { Interpreter } from 'wollok-ts/dist/interpreter/interpreter'
import { GameProject } from './gameProject'
import { GameSound, SoundState, SoundStatus } from './GameSound'
import { DrawableMessage, drawMessage } from './messages'
import { buildKeyPressEvent, visualState, flushEvents, hexaToColor, baseDrawable, draw, moveAllTo, write } from './SketchUtils'
import Menu from '../Menu'
import { SketchContext, SketchProvider } from '../../context/SketchContext'

const { round } = Math

export interface SketchProps {
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

export function step(assets: StepAssets) {
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

export function updateSound(assets: SoundAssets) {
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
const SketchComponent = (props: SketchProps) => {
  const { restart, pauseAndExit, stop, setup, draw, keyPressed } = useContext(SketchContext)

  return (
    //<SketchProvider {... props}>
      <div>
        <Menu
          restart={restart}
          exit={pauseAndExit}
          gameDescription={props.gameProject.description}
        />
        <div>
          {stop
            ? <h1>Se terminó el juego</h1>
            : <Sketch setup={setup} draw={draw} keyPressed={keyPressed} />}
        </div>
      </div>
    //</SketchProvider>
  )
}

export default SketchComponent