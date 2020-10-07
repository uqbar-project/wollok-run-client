import { Evaluation, interpret, WRENatives } from 'wollok-ts'
import { Board } from './utils'
import { RuntimeObject, TRUE_ID } from 'wollok-ts/dist/interpreter'
import { Id } from 'wollok-ts'
import { Runtime } from 'inspector'

export const io = (evaluation: Evaluation) => evaluation.environment.getNodeByFQN('wollok.io.io').id

export const gameInstance = (evaluation: Evaluation): RuntimeObject => {
  return evaluation.instance(evaluation.environment.getNodeByFQN('wollok.game.game').id)
}

function gameInstanceField(evaluation: Evaluation, field: string): RuntimeObject | undefined {
  const gameField: RuntimeObject | undefined = gameInstance(evaluation).get(field)
  return gameField && evaluation.instance(gameField.id)
}

function numberGameFieldValue(evaluation: Evaluation, field: string): number {
  const fieldInst: RuntimeObject = gameInstanceField(evaluation, field)!
  fieldInst.assertIsNumber()
  return fieldInst.innerValue
}

function stringGameFieldValue(evaluation: Evaluation, field: string): string {
  const fieldInst: RuntimeObject = gameInstanceField(evaluation, field)!
  fieldInst.assertIsString()
  return fieldInst.innerValue
}

function listGameFieldValue(evaluation: Evaluation, field: string): Id[] {
  const fieldInst: RuntimeObject = gameInstanceField(evaluation, field)!
  fieldInst.assertIsCollection()
  return fieldInst.innerValue
}

export function width(evaluation: Evaluation): number {
  return numberGameFieldValue(evaluation, 'width')
}

export function height(evaluation: Evaluation): number {
  return numberGameFieldValue(evaluation, 'height')
}

export function cellSize(evaluation: Evaluation): number {
  return numberGameFieldValue(evaluation, 'cellSize')
}

function ground(evaluation: Evaluation): string {
  return stringGameFieldValue(evaluation, 'ground')
}

export function boardGround(evaluation: Evaluation): string | undefined {
  return gameInstanceField(evaluation, 'boardGround') && stringGameFieldValue(evaluation, 'boardGround')
}

function visuals(evaluation: Evaluation): Id[] {
  return listGameFieldValue(evaluation, 'visuals')
}

function sounds(evaluation: Evaluation): Id[] {
  return gameInstanceField(evaluation, 'sounds') ? listGameFieldValue(evaluation, 'sounds') : []
}

export const emptyBoard = (evaluation: Evaluation): Board => {
  const groundPath = ground(evaluation)
  const boardgroundPath = boardGround(evaluation)
  return Array.from(Array(height(evaluation)), () =>
    Array.from(Array(width(evaluation)), () => !boardgroundPath ? [{ img: groundPath }] : [])
  )
}

export const flushEvents = (evaluation: Evaluation, ms: number): void => {
  const { sendMessage } = interpret(evaluation.environment, WRENatives)
  const time = evaluation.createInstance('wollok.lang.Number', ms)
  sendMessage('flushEvents', io(evaluation), time)(evaluation)
}

export const nextBoard = (evaluation: Evaluation): Board => {
  const next = emptyBoard(evaluation)
  for (const { position: { x, y }, image, message } of currentVisualStates(evaluation)) {
    next[y] && next[y][x] && next[y][x].push({ img: `${image}`, message })
  }
  return next
}



const getVisualPosition = (visual: RuntimeObject) => (evaluation: Evaluation) => {
  let position = visual.get('position')
  if (!position) {
    const { sendMessage } = interpret(evaluation.environment, WRENatives)
    sendMessage('position', visual.id)(evaluation)
    position = evaluation.instance(evaluation.currentFrame()!.operandStack.pop()!)
  }
  const wx: RuntimeObject = evaluation.instance(position.get('x')!.id)
  wx.assertIsNumber()
  const x: number = wx.innerValue
  const wy: RuntimeObject = evaluation.instance(position.get('y')!.id)
  wy.assertIsNumber()
  const y: number = wy.innerValue

  return { x, y }
}

const getVisualImage = (visual: RuntimeObject) => (evaluation: Evaluation): string => {
  if (visual.module().lookupMethod('image', 0)) {
    const { sendMessage } = interpret(evaluation.environment, WRENatives)
    sendMessage('image', visual.id)(evaluation)
    const wImage: RuntimeObject = evaluation.instance(evaluation.currentFrame()!.operandStack.pop()!)
    wImage.assertIsString()
    return wImage.innerValue
  } else {
    return 'wko.png'
  }
}

interface VisualMessage {
  text: string;
  time: number;
}

const getVisualMessage = (visual: RuntimeObject): VisualMessage | undefined => {
  if (visual.get('message')) {
    const wMessage: RuntimeObject = visual.get('message')!
    wMessage.assertIsString()
    const message: string = wMessage.innerValue
    const wMessageTime: RuntimeObject = visual.get('messageTime')!
    wMessageTime.assertIsNumber()
    const messageTime: number = wMessageTime.innerValue

    return { text: message, time: messageTime, }
  }
  else {
    return undefined
  }
}

interface VisualState {
  position: {
    x: number;
    y: number;
  };
  image: string;
  message?: VisualMessage;
}

export const currentVisualStates = (evaluation: Evaluation): VisualState[] => {
  return visuals(evaluation).map((id: Id) => {
    const visual = evaluation.instance(id)
    const position = getVisualPosition(visual)(evaluation)
    const image = getVisualImage(visual)(evaluation)
    const message = getVisualMessage(visual)

    return { position, image, message }
  })

}
type SoundStatus = 'played' | 'paused' | 'stopped'
export interface SoundState {
  id: Id;
  file: string;
  status: SoundStatus;
  volume: number;
  loop: boolean;
}

export const currentSoundStates = (evaluation: Evaluation): SoundState[] => {
  return sounds(evaluation).map((id: Id) => {
    const sound: RuntimeObject = evaluation.instance(id)
    const wFile: RuntimeObject = evaluation.instance(sound.get('file')!.id)
    wFile.assertIsString()
    const file = wFile.innerValue

    const wStatus: RuntimeObject = evaluation.instance(sound.get('status')!.id)
    wStatus.assertIsString()
    const status = wStatus.innerValue as SoundStatus

    const wVolume: RuntimeObject = evaluation.instance(sound.get('volume')!.id)
    wVolume.assertIsNumber()
    const volume = wVolume.innerValue

    const wLoop: RuntimeObject = evaluation.instance(sound.get('loop')!.id)
    //wLoop.assertIsBoolean()
    const loop = wLoop.id === TRUE_ID

    return { id, file, status, volume, loop }
  })

}