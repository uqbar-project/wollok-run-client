import p5 from 'p5'
import React, { useState } from 'react'
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

  window.performance.mark('draw-background-start')
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
  window.performance.mark('draw-background-end')

  window.performance.mark('draw-visuals-start')
  const cellPixelSize = cellSize(evaluation)
  const messagesToDraw: DrawableMessage[] = []
  for (const visual of yield* currentVisualStates(evaluation)) {
    const imageObject = image(visual.image)
    const x = visual.position.x * cellPixelSize
    const y = sketch.height - visual.position.y * cellPixelSize - imageObject.height
    sketch.image(imageObject, x, y)

    if (visual.message && visual.message.time > sketch.millis()) messagesToDraw.push({ message: visual.message.text, x, y })
  }
  window.performance.mark('draw-visuals-end')

  window.performance.mark('draw-messages-start')
  messagesToDraw.forEach(drawMessage(sketch))
  window.performance.mark('draw-messages-end')

  window.performance.measure('draw-background-start-to-end', 'draw-background-start', 'draw-background-end')
  window.performance.measure('draw-visuals-start-to-end', 'draw-visuals-start', 'draw-visuals-end')
  window.performance.measure('draw-messages-start-to-end', 'draw-messages-start', 'draw-messages-end')

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

  setInterval(() => {
    const measures = performance.getEntriesByType('measure')
    performance.clearMeasures()

    const updateMeasures = measures.filter(measure => measure.name === 'update-start-to-end')
    const totalUpdateTime = updateMeasures.reduce((sum, measure) => sum + measure.duration, 0)

    const keyMeasures = measures.filter(measure => measure.name === 'key-start-to-end')
    const totalKeyTime = keyMeasures.reduce((sum, measure) => sum + measure.duration, 0)

    const drawMeasures = measures.filter(measure => measure.name === 'draw-start-to-end')
    const totalDrawTime = drawMeasures.reduce((sum, measure) => sum + measure.duration, 0)

    const drawBackgroundMeasures = measures.filter(measure => measure.name === 'draw-background-start-to-end')
    const totalDrawBackgroundTime = drawBackgroundMeasures.reduce((sum, measure) => sum + measure.duration, 0)

    const listVisualsMeasures = measures.filter(measure => measure.name === 'list-visuals-start-to-end')
    const totalListVisualsTime = listVisualsMeasures.reduce((sum, measure) => sum + measure.duration, 0)

    const drawVisualsMeasures = measures.filter(measure => measure.name === 'draw-visuals-start-to-end')
    const totalDrawVisualsTime = drawVisualsMeasures.reduce((sum, measure) => sum + measure.duration, 0)

    const drawMessagesMeasures = measures.filter(measure => measure.name === 'draw-messages-start-to-end')
    const totalDrawMessagesTime = drawMessagesMeasures.reduce((sum, measure) => sum + measure.duration, 0)


    const instances = evaluation.allInstances()
    console.log(`
      FPS: ${drawMeasures.length}
      Average Draw Time: ${Math.round(drawMeasures.length ? totalDrawTime / drawMeasures.length : 0)}ms (${(totalDrawTime / 1000 * 100).toFixed(2)}%)
        - Background: ${Math.round(drawBackgroundMeasures.length ? totalDrawBackgroundTime / drawBackgroundMeasures.length : 0)}ms (${(totalDrawBackgroundTime / totalDrawTime * 100).toFixed(2)}%)
        - List Visuals: ${Math.round(listVisualsMeasures.length ? totalListVisualsTime / listVisualsMeasures.length : 0)}ms (${(totalListVisualsTime / totalDrawTime * 100).toFixed(2)}%)
        - Visuals: ${Math.round(drawVisualsMeasures.length ? totalDrawVisualsTime / drawVisualsMeasures.length : 0)}ms (${(totalDrawVisualsTime / totalDrawTime * 100).toFixed(2)}%)
        - Messages: ${Math.round(drawMessagesMeasures.length ? totalDrawMessagesTime / drawMessagesMeasures.length : 0)}ms (${(totalDrawMessagesTime / totalDrawTime * 100).toFixed(2)}%)
      Average Update Time: ${Math.round(updateMeasures.length ? totalUpdateTime / updateMeasures.length : 0)}ms (${(totalUpdateTime / 1000 * 100).toFixed(2)}%)
      Average Key Time: ${Math.round(keyMeasures.length ? totalKeyTime / keyMeasures.length : 0)}ms (${(totalKeyTime / 1000 * 100).toFixed(2)}%)
      Instances: ${instances.size}
    `)
  }, 1000)

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