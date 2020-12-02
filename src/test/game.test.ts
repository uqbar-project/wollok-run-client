import fs from 'fs'
import { buildEnvironment, interpret, Evaluation, Id } from 'wollok-ts/dist'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { VisualState, currentSoundStates, SoundState, flushEvents, canvasResolution, currentVisualStates } from '../components/game/GameStates'
import { RuntimeObject } from 'wollok-ts/dist/interpreter'
import { wKeyCode, buildKeyPressEvent, queueGameEvent } from '../components/game/SketchUtils'
import { buildGameProject, GameProject } from '../components/game/gameProject'
import { MessageDrawer, messageTextPosition } from '../components/game/messages'

const readFiles = (files: string[]) => files.map(file => ({
  name: file,
  content: fs.readFileSync(`src/test/${file}`, 'utf8'),
}))

describe('game', () => {
  const gameTest = (testName: string, gameProgramFile: string, gameFiles: string[], cbTest: (evaluation: Evaluation) => void) => {
    const environment = buildEnvironment(readFiles(gameFiles))
    const { buildEvaluation, runProgram } = interpret(environment, wre)
    const evaluation = buildEvaluation()
    runProgram(`games.${gameProgramFile}.mockGame`, evaluation)
    it(testName, () => cbTest(evaluation))
  }

  gameTest('a visual outside of the canvas should not be drawn', 'gameTest', ['games/gameTest.wpgm'], (evaluation) => {
    const visuals: VisualState[] = currentVisualStates(evaluation)
    expect(visuals).toContainEqual({ image: 'in.png', position: { x: 0, y: 0 }, message: undefined })
    expect(visuals).not.toContainEqual({ image: 'out.png', position: { x: -1, y: -1 }, message: undefined })
  })

  gameTest('visualStates', 'pepita', ['games/pepita.wpgm'], (evaluation) => {
    const pepitaState: VisualState = currentVisualStates(evaluation)[0]
    expect(pepitaState).toStrictEqual({
      image: 'pepita.png',
      position: { x: 1, y: 1 },
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
    expect(pepitaState.position).toStrictEqual({ x: 1, y: 1 })
    flushEvents(evaluation, 101)
    const newPepitaState: VisualState = currentVisualStates(evaluation)[0]
    expect(newPepitaState.position).toStrictEqual({ x: 0, y: 0 })
  })

  gameTest('canvasResolution', 'gameResolution', ['games/gameResolution.wpgm'], (evaluation) => {
    const resolution = canvasResolution(evaluation)

    expect(resolution).toStrictEqual({
      x: 300,
      y: 375,
    })
  })

  gameTest('buildKeyPressEvent', 'pepita', ['games/pepita.wpgm'], (evaluation) => {
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

  gameTest('When a key is pressed, the event associated with the key should happen', 'movement', ['games/movement.wpgm'], (evaluation) => {
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

describe('buildGameProject', () => {
  let gameProject: GameProject

  const expectEqualElements = (list1: any[], list2: any[]) =>
    expect(list1.sort()).toEqual(list2.sort())

  beforeAll(() => {
    const filePaths = ['src/pepita.wlk', 'src/juego.wpgm', 'assets/pepita.png', 'src/sound.mp3', '.classpath', 'README.md'].map(path => `gameProject/${path}`)
    const allFiles = readFiles(filePaths).map((file) => { return { name: file.name, content: new Buffer(file.content) } })
    URL.createObjectURL = jest.fn().mockReturnValue('asd')
    gameProject = buildGameProject(allFiles)
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  test('media paths', () => {
    expectEqualElements(gameProject.images[0].possiblePaths, ['assets/pepita.png', 'pepita.png'])
    expectEqualElements(gameProject.sounds[0].possiblePaths, ['src/sound.mp3', 'sound.mp3'])
  })

  test('main', () => {
    expect(gameProject.main).toStrictEqual('gameProject.src.juego')
  })

  test('wollok files', () => {
    expectEqualElements(gameProject.sources.map(sourceFile => sourceFile.name), ['gameProject/src/juego.wpgm', 'gameProject/src/pepita.wlk'])
  })

  test('description', () => {
    expect(gameProject.description.trim()).toBe('Descripcion de pepita')
  })

})

describe('messages', () => {
  const drawer: MessageDrawer = {
    width: 100,
    textWidth: (text: string) => 5.5 * text.length,
    rect: () => { },
    text: () => { },
  }

  test('when a message is horizontally out of canvas, it should be inverted', () => {
    const message = { message: 'holaholaholaholaholaholaholaholaholahola', x: 99, y: 0 }
    expect(messageTextPosition(drawer, message).x).toBeLessThan(message.x)
  })

  test('when a message is horizontally out of canvas, it should be inverted', () => {
    const message = { message: 'holaholaholaholaholaholaholaholaholahola', x: 0, y: 10 }
    expect(messageTextPosition(drawer, message).y).toBeGreaterThan(message.y)
  })

  test('when a message is inside the canvas, it should not be inverted', () => {
    const message = { message: 'hola', x: 0, y: 200 }
    expect(messageTextPosition(drawer, message).y).toBeLessThan(message.y)
    expect(messageTextPosition(drawer, message).x).toBeGreaterThan(message.x)
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