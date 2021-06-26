import p5 from 'p5'
import React, { useEffect, useState } from 'react'
import Sketch from 'react-p5'
import 'p5/lib/addons/p5.sound'
import { Evaluation, Id, ExecutionDirector } from 'wollok-ts'
import { GameProject, DEFAULT_GAME_ASSETS_DIR } from './gameProject'
import { flushEvents, boardGround, cellSize, currentSoundStates, canvasResolution, gameStop, ground, height, width, currentVisualStates } from './GameStates'
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

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// GAME CYCLE
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

function* step(sketch: p5, game: GameProject, evaluation: Evaluation, sounds: Map<Id, GameSound>, images: Map<Id, p5.Image>) {
  window.performance.mark('update-start')
  yield* flushEvents(evaluation, sketch.millis())
  updateSound(game, evaluation, sounds)
  window.performance.mark('update-end')

  window.performance.mark('draw-start')
  yield* render(evaluation, sketch, images)
  window.performance.mark('draw-end')

  window.performance.measure('update-start-to-end', 'update-start', 'update-end')
  window.performance.measure('draw-start-to-end', 'draw-start', 'draw-end')

  return undefined
}

function updateSound(game: GameProject, evaluation: Evaluation, sounds: Map<Id, GameSound>) {
  const soundStates = currentSoundStates(evaluation)

  for(const [id, sound] of sounds.entries()) {
    if(!soundStates.some(sound => sound.id === id)) {
      sound.stopSound()
      sounds.delete(id)
    } else {
      sound.playSound()
    }
  }

  soundStates.forEach(soundState => {
    let sound = sounds.get(soundState.id)
    if (!sound) {
      const soundPath = game.sounds.find(({ possiblePaths }) => possiblePaths.includes(soundState.file))?.url
      if(soundPath) { // TODO: add soundfile not found exception
        sound = new GameSound(soundState, soundPath)
        sounds.set(soundState.id, sound)
      }
    }

    sound?.update(soundState)
  })
}

function* render(evaluation: Evaluation, sketch: p5, images: Map<string, p5.Image>) {
  const image = (path: string): p5.Image => images.get(path) ?? images.get('wko.png')!

  const boardGroundPath = boardGround(evaluation)
  if (boardGroundPath) sketch.image(image(boardGroundPath), 0, 0, sketch.width, sketch.height)
  else {
    const groundImage = image(ground(evaluation))
    const gameWidth = width(evaluation)
    const gameHeigth = height(evaluation)
    for (let x = 0; x < gameWidth; x++)
      for (let y = 0; y < gameHeigth; y++)
        sketch.image(groundImage, x, y)
  }

  const cellPixelSize = cellSize(evaluation)
  const messagesToDraw: DrawableMessage[] = []
  for (const visual of yield* currentVisualStates(evaluation)) {
    const imageObject = image(visual.image)
    const x = visual.position.x * cellPixelSize
    const y = sketch.height - visual.position.y * cellPixelSize - imageObject.height
    sketch.image(imageObject, x, y)

    if (visual.message && visual.message.time > sketch.millis()) messagesToDraw.push({ message: visual.message.text, x, y })
  }

  messagesToDraw.forEach(drawMessage(sketch))
  return undefined
}

// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════════════════════════════════════════

const SketchComponent = ({ game, evaluation: initialEvaluation }: SketchProps) => {
  const [stop, setStop] = useState(false)
  const images = new Map<string, p5.Image>()
  const sounds = new Map<Id, GameSound>()
  let evaluation = initialEvaluation.copy()

  useEffect(() => {
    setInterval(() => {
      const measures = performance.getEntriesByType('measure')
      performance.clearMeasures()

      function inform(measureName: string) {
        const selectedMeasures = measures.filter(measure => measure.name === measureName)
        const totalTime = selectedMeasures.reduce((sum, measure) => sum + measure.duration, 0)
        const averageDuration =selectedMeasures.length ? totalTime / selectedMeasures.length : 0
        const durationPercentage = totalTime * 100 / 1000
        return `${ Math.round(averageDuration)}ms (${durationPercentage.toFixed(2)}%)`
      }

      const instances = evaluation.allInstances()
      console.log(`
        FPS: ${measures.filter(measure => measure.name === 'draw-start-to-end').length}
        Average Draw Time: ${inform('draw-start-to-end')}
        Average Update Time: ${inform('update-start-to-end')}
        Average Key Time: ${inform('key-start-to-end')}
        Instances: ${instances.size}
      `)
    }, 1000)
  }, [evaluation])

  function setup(sketch: p5, canvasParentRef: Element) {
    const resolution = canvasResolution(evaluation)
    sketch.createCanvas(resolution.x, resolution.y).parent(canvasParentRef)

    defaultImgs.forEach(path => images.set(path, sketch.loadImage(DEFAULT_GAME_ASSETS_DIR + path)))

    game.images.forEach(({ possiblePaths, url }) =>
      possiblePaths.forEach(path =>
        images.set(path, sketch.loadImage(url))
      )
    )
  }

  function draw(sketch: p5) {
    if (gameStop(evaluation)) setStop(true)
    else new ExecutionDirector(evaluation, step(sketch, game, evaluation, sounds, images)).finish()
  }

  function keyPressed(sketch: p5) {
    new ExecutionDirector(evaluation, function* () {
      window.performance.mark('key-start')
      yield* queueGameEvent(evaluation, yield* buildKeyPressEvent(evaluation, wKeyCode(sketch.key, sketch.keyCode)))
      yield* queueGameEvent(evaluation, yield* buildKeyPressEvent(evaluation, 'ANY'))
      window.performance.mark('key-end')
      window.performance.measure('key-start-to-end', 'key-start', 'key-end')
      return undefined
    }()).finish()

    return false
  }

  function restart() {
    evaluation = initialEvaluation.copy()
    setStop(false)
  }

  return <div>
    {stop ?
      <h1>Se terminó el juego</h1>
      : <Sketch setup={setup} draw={draw} keyPressed={keyPressed} />}
    <RestartButton restart={restart} />
  </div>
}

export default SketchComponent

type RestartProps = { restart: () => void }
export function RestartButton(props: RestartProps) {
  return <Button onClick={event => { event.preventDefault(); props.restart() }} variant="contained" color="primary" startIcon={<ReplayIcon />}>Reiniciar el juego</Button>
}