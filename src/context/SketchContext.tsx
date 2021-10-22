import React, { createContext, ReactNode, useEffect, useState } from 'react'
import p5 from 'p5'
import { Id } from 'wollok-ts'
import { Interpreter } from 'wollok-ts/dist/interpreter/interpreter'
import { GameSound } from '../components/game/GameSound'
import { SketchProps, step, updateSound } from '../components/game/Sketch'
import { DEFAULT_GAME_ASSETS_DIR } from '../components/game/gameProject'
import { buildKeyPressEvent, canvasResolution, queueEvent, resizeCanvas } from '../components/game/SketchUtils'

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

interface SketchState {
  gamePaused: boolean
  audioMuted: boolean
  menuSize: number
  stop: boolean
  toggleAudio: () => void
  togglePause: () => void
  setup: (sketch: p5, canvasParentRef: Element) => void
  draw: (sketch: p5) => void
  keyPressed: (sketch: p5) => boolean,
  restart: () => void
  pauseAndExit: () => void
}

type SketchProviderProps = SketchProps & {
  children: ReactNode
}

export const SketchContext = createContext<SketchState>({} as SketchState)

export const SketchProvider = ({ gameProject, evaluation: initialEvaluation, exit, children }: SketchProviderProps) => {
  const [gamePaused, setGamePaused] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)
  const [stop, setStop] = useState(false)
  const [interpreter, setInterpreter] = useState(new Interpreter(initialEvaluation.copy()))
  const images = new Map<string, p5.Image>()
  const sounds = new Map<Id, GameSound>()
  const menuSize = 4

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
  
  function toggleAudio() {
    setAudioMuted(!audioMuted)
  }

  function togglePause() {
    setGamePaused(!gamePaused)
  }

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
    setInterpreter(new Interpreter(initialEvaluation.copy()))
  }

  function pauseAndExit() {
    setAudioMuted(true)
    updateSound({ gameProject, interpreter, sounds, audioMuted })
    exit()
  }

  const value = {
    gamePaused,
    audioMuted,
    menuSize,
    stop,
    toggleAudio,
    togglePause,
    setup,
    draw,
    keyPressed,
    restart,
    pauseAndExit
  }

  return (
    <SketchContext.Provider value={value}>
      {children}
    </SketchContext.Provider>
  )
}