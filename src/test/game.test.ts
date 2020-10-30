import fs from 'fs'
import { boardToLayers } from '../components/game/utils'
import { buildEnvironment, interpret, Evaluation, Id } from 'wollok-ts/dist'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { nextBoard, currentVisualStates, VisualState, currentSoundStates, SoundState, flushEvents, canvasResolution } from '../components/game/GameStates'
import { RuntimeObject } from 'wollok-ts/dist/interpreter'
import { wKeyCode, buildKeyPressEvent, queueGameEvent } from '../components/game/SketchUtils'

const readFiles = (files: string[]) => files.map(file => ({
  name: file,
  content: fs.readFileSync(`src/test/${file}`, 'utf8'),
}))

describe('game', () => {
  const ground1 = { img: 'ground1' }
  const ground2 = { img: 'ground2' }
  const pepita2 = { img: 'pepita2' }
  const pepita3 = { img: 'pepita3' }

  const board = [
    [[ground1], [ground1, pepita2], [ground1]],
    [[ground2], [ground2, pepita2, pepita3], [ground2]],
  ]

  test('board to layers', () => {
    const layers = boardToLayers(board)
    expect(layers).toEqual([
      [
        [ground1, ground1, ground1],
        [ground2, ground2, ground2],
      ],
      [
        [undefined, pepita2, undefined],
        [undefined, pepita2, undefined],
      ],
      [
        undefined,
        [undefined, pepita3, undefined],
      ],
    ])
  })

  const gameTest = (testName: string, gameProgramFile: string, gameFiles: string[], cbTest: (evaluation: Evaluation) => void) => {
    const environment = buildEnvironment(readFiles(gameFiles))
    const { buildEvaluation, runProgram } = interpret(environment, wre)
    const evaluation = buildEvaluation()
    runProgram(`games.${gameProgramFile}.mockGame`, evaluation)
    it(testName, () => cbTest(evaluation))
  }

  gameTest('a visual outside of the canvas should not be drawn', 'gameTest', ['games/gameTest.wpgm'], (evaluation) => {
    const [[visuals]] = nextBoard(evaluation)
    expect(visuals).toContainEqual({ img: 'in.png' })
    expect(visuals).not.toContainEqual({ img: 'out.png' })
  })

  gameTest('visualStates', 'pepita', ['games/pepita.wpgm'], (evaluation) => {
    const pepitaState: VisualState = currentVisualStates(evaluation)[0]
    expect(pepitaState).toStrictEqual({
      image: 'pepita.png',
      position: { x: 1, y: -1 },
      message: undefined,
    })
  })

  gameTest('soundStates', 'sounds', ['games/sounds.wpgm'], (evaluation) => {
    const soundState: SoundState = currentSoundStates(evaluation)[0]
    expect(soundState).toStrictEqual({
      id: soundState.id,
      file: 'sound.mp3',
      status: 'played',
      volume: 1,
      loop: false,
    })
  })

  gameTest('flushEvents', 'pepita', ['games/pepita.wpgm'], (evaluation) => {
    const pepitaState: VisualState = currentVisualStates(evaluation)[0]
    expect(pepitaState.position).toStrictEqual({ x: 1, y: -1 })
    flushEvents(evaluation, 101)
    const newPepitaState: VisualState = currentVisualStates(evaluation)[0]
    expect(newPepitaState.position).toStrictEqual({ x: 0, y: 0 })
  })

  gameTest('The canvas resolution should be calculated according to the game', 'gameResolution', ['games/gameResolution.wpgm'], (evaluation) => {
    const resolution = canvasResolution(evaluation)

    expect(resolution).toStrictEqual({
      x: 300,
      y: 375,
    })
  })

  gameTest('Key press events', 'pepita', ['games/pepita.wpgm'], (evaluation) => {
    const keyCode = wKeyCode('1', 49)
    const wKeyPressEventId: Id = buildKeyPressEvent(evaluation, keyCode)
    const wKeyPressEvent: RuntimeObject = evaluation.instance(wKeyPressEventId)
    wKeyPressEvent.assertIsCollection()
    const keyPressEvent: string[] = wKeyPressEvent.innerValue.map((id: Id) => {
      const wString: RuntimeObject = evaluation.instance(id)
      wString.assertIsString()
      return wString.innerValue
    })
    expect(keyPressEvent).toStrictEqual(['keypress', 'Digit1'])

  })

  gameTest('Cuando se toca una tecla, el evento asociado debe ocurrir', 'movement', ['games/movement.wpgm'], (evaluation) => { //traducir a english
    const keyCode = wKeyCode('ArrowRight', 39)
    const keyPressEvent: Id = buildKeyPressEvent(evaluation, keyCode)
    const firstPepitaPosition = currentVisualStates(evaluation)[0].position
    expect(firstPepitaPosition).toStrictEqual({ x: 0, y: 0 })
    queueGameEvent(evaluation, keyPressEvent)
    flushEvents(evaluation, 1)
    const finalPepitaPosition = currentVisualStates(evaluation)[0].position
    expect(finalPepitaPosition).toStrictEqual({ x: 1, y: 1 })
  })
})

/*
describe('GameSound', () => {

  const soundState: SoundState = {
    id: 'abc',
    file: 'sound.mp3',
    status: 'played',
    volume: 1,
    loop: false,
  }

  test('sound', () => {
    const sound: GameSound = new GameSound(soundState, 'games/sound.mp3')
    jest.spyOn(sound, 'isLoaded').mockReturnValueOnce(false).mockReturnValueOnce(true)
    expect(sound.canBePlayed(soundState)).toBeFalsy()
    expect(sound.canBePlayed(soundState)).toBeTruthy()
  })
})
*/