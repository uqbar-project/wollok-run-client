import fs from 'fs'
import { buildEnvironment, WRENatives } from 'wollok-ts'
import interpret, { Interpreter } from 'wollok-ts/dist/interpreter/interpreter'
import { visualState, flushEvents, canvasResolution, wKeyCode, buildKeyPressEvent, queueEvent } from '../components/game/SketchUtils'
import { buildGameProject, GameProject, getProgramIn, NoProgramException, MultiProgramException } from '../components/game/gameProject'
import { MessageDrawer, messageTextPosition } from '../components/game/messages'
import { newGitSearch } from '../components/filesSelector/GitSelector'

const readFiles = (files: string[]) => files.map(file => ({
  name: file,
  content: fs.readFileSync(`src/test/${file}`, 'utf8'),
}))

const gameTest = (testName: string, gameProgramFile: string, gameFiles: string[], cbTest: (interpreter: Interpreter) => void) => {
  const environment = buildEnvironment(readFiles(gameFiles))
  const interpreter = interpret(environment, WRENatives)
  interpreter.exec(getProgramIn(`games.${gameProgramFile}`, environment))
  test(testName, () => cbTest(interpreter))
}

const getVisualState = (interpreter: Interpreter, index = 0) => {
  const game = interpreter.object('wollok.game.game')
  const visual = game.get('visuals')!.innerCollection![index]
  const state = visualState(interpreter, visual)
  return state
}

function buildGameProjectFrom(prefix: string, projectFiles: string[]): GameProject {
  return buildGameProject(allFiles(addPrefix(prefix, projectFiles)))
}

function allFiles(filePaths: string[]) {
  return readFiles(filePaths).map((file) => { return { name: file.name, content: new Buffer(file.content) } })
}

function addPrefix(prefix: string, filePaths: string[]){
  return filePaths.map(path => prefix + path)
}

describe('game', () => {
  gameTest('a visual outside of the canvas should be drawn', 'gameTest', ['games/gameTest.wpgm'], function (interpreter) {
    expect(getVisualState(interpreter, 1)).toMatchObject({ image: 'out.png' })
  })

  gameTest('flushEvents', 'pepita', ['games/pepita.wpgm'], function (interpreter) {
    expect(getVisualState(interpreter).position).toStrictEqual({ x: 1, y: 1 })
    flushEvents(interpreter, 101)
    expect(getVisualState(interpreter).position).toStrictEqual({ x: 0, y: 0 })
  })

  gameTest('canvasResolution', 'gameResolution', ['games/gameResolution.wpgm'], function (interpreter) {
    expect(canvasResolution(interpreter)).toStrictEqual({
      width: 300,
      height: 375,
    })
  })

  gameTest('buildKeyPressEvent', 'pepita', ['games/pepita.wpgm'], function (interpreter) {
    const keyCode = wKeyCode('1', 49)
    const wKeyPressEvent = buildKeyPressEvent(interpreter, keyCode)
    const keyPressEvent = wKeyPressEvent.innerCollection!.map((obj) => obj.innerString)
    expect(keyPressEvent).toStrictEqual(['keypress', 'Digit1'])
  })

  gameTest('When a key is pressed, the event associated with the key should happen', 'movement', ['games/movement.wpgm'], function (interpreter) {
    const keyCode = wKeyCode('ArrowRight', 39)
    const wKeyPressEvent = buildKeyPressEvent(interpreter, keyCode)
    const firstPepitaPosition = getVisualState(interpreter).position
    expect(firstPepitaPosition).toStrictEqual({ x: 0, y: 0 })
    queueEvent(interpreter, wKeyPressEvent)
    flushEvents(interpreter, 1)
    const finalPepitaPosition = getVisualState(interpreter).position
    expect(finalPepitaPosition).toStrictEqual({ x: 1, y: 1 })
  })
})

describe('buildGameProject', () => {
  let gameProject: GameProject

  const expectEqualElements = (list1: any[], list2: any[]) =>
    expect(list1.sort()).toEqual(list2.sort())

  beforeAll(() => {
    const filePaths = addPrefix('gameProject/', ['src/pepita.wlk', 'src/juego.wpgm', 'assets/pepita.png', 'src/sound.mp3', '.classpath', 'README.md'])
    const _allFiles = allFiles(filePaths)
    URL.createObjectURL = jest.fn().mockReturnValue('asd')
    gameProject = buildGameProject(_allFiles)
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

describe('buildGameProject Errors', () => {

  const projectFiles = ['src/pepita.wlk', '.classpath']
  const prefix = 'gameProject/'

  test('building a game project with no program should fail', () => {
    expect(() => buildGameProjectFrom(prefix, projectFiles)).toThrow(NoProgramException)
  })

  test('building a game project with more than one program should fail', () => {
    expect(() => buildGameProjectFrom(prefix, projectFiles.concat('src/juego.wpgm', 'src/otroJuego.wpgm'))).toThrow(MultiProgramException)
  })
})

describe('messages', () => {
  const drawer: MessageDrawer = {
    width: 100,
    textWidth: (text: string) => 5.5 * text.length,
    rect: () => { },
    text: () => { },
    fill: () => { },
    textAlign: () => { },
    textSize: () => { },
    textStyle: () => { },
    stroke: () => { },
    noStroke: () => { },
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

describe('VisualState', () => {
  gameTest('positionable visual', 'visualStateTest', ['games/visualStateTest.wpgm'], function (interpreter) {
    expect(getVisualState(interpreter, 0)).toStrictEqual({
      image: undefined,
      position: { x: 1, y: 2 },
      message: undefined,
      text: undefined,
      textColor: undefined,
    })
  })

  gameTest('complete visual', 'visualStateTest', ['games/visualStateTest.wpgm'], function (interpreter) {
    expect(getVisualState(interpreter, 1)).toStrictEqual({
      image: 'anImage.png',
      position: { x: 0, y: 0 },
      message: undefined,
      text: 'Sample text',
      textColor: 'FF0000FF',
    })
  })

})

describe('search', () => {
  const pepitaRepoURL = 'https://github.com/wollok/pepitagame'
  const titanicRepoURL = 'https://github.com/wollok/TitanicGame'
  const pepitaRepoSearch = `git=${pepitaRepoURL}`
  const param = 'happy=true'

  test('search should be decoded', () => {
    expect(newGitSearch('', pepitaRepoURL)).toEqual(pepitaRepoSearch)
  })

  test('if no url is provided, current search should be deleted', () => {
    expect(newGitSearch(pepitaRepoSearch)).toEqual('')
  })

  test("if a url already exists, it should be replaced", () => {
    expect(newGitSearch(pepitaRepoSearch, titanicRepoURL)).toEqual(`git=${titanicRepoURL}`)
  })

  test('different params should be added', () => {
    expect(newGitSearch(param, pepitaRepoURL)).toEqual(`${param}&${pepitaRepoSearch}`)
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

  gameTest('soundStates', 'sounds', ['games/sounds.wpgm'], function* (evaluation) {
    const soundState: SoundState = currentSoundStates(evaluation)[0]
    expect(soundState).toStrictEqual({
      id: soundState.id,
      file: 'sound.mp3',
      status: 'played',
      volume: 1,
      loop: false,
    })
  })


  test('sound', () => {
    const sound: GameSound = new GameSound(soundState, 'games/sound.mp3')
    jest.spyOn(sound, 'isLoaded').mockReturnValueOnce(false).mockReturnValueOnce(true)
    expect(sound.canBePlayed(soundState)).toBeFalsy()
    expect(sound.canBePlayed(soundState)).toBeTruthy()
  })

})
*/