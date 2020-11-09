import { Evaluation, interpret, WRENatives } from 'wollok-ts'
import { Board } from './utils'
import { RuntimeObject, TRUE_ID } from 'wollok-ts/dist/interpreter'
import { Id } from 'wollok-ts'

export const io = (evaluation: Evaluation): Id => evaluation.environment.getNodeByFQN('wollok.io.io').id

export const gameInstance = (evaluation: Evaluation): RuntimeObject => {
  return evaluation.instance(evaluation.environment.getNodeByFQN('wollok.game.game').id)
}

function getInstanceFieldFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): RuntimeObject | undefined {
  const gameField: RuntimeObject | undefined = wObject.get(field)
  return gameField && evaluation.instance(gameField.id)
}

function getNumberFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): number {
  const fieldInst: RuntimeObject = getInstanceFieldFrom(wObject, evaluation, field)!
  fieldInst.assertIsNumber()
  return fieldInst.innerValue
}

function getStringFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): string {
  const fieldInst: RuntimeObject = getInstanceFieldFrom(wObject, evaluation, field)!
  fieldInst.assertIsString()
  return fieldInst.innerValue
}

function getListFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): Id[] {
  const fieldInst: RuntimeObject = getInstanceFieldFrom(wObject, evaluation, field)!
  if (!fieldInst) return [] //TODO: Iniciar la colección de visuals en TS
  fieldInst.assertIsCollection()
  return fieldInst.innerValue
}

function getBooleanFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): boolean {
  const fieldInst: RuntimeObject = getInstanceFieldFrom(wObject, evaluation, field)!
  //fieldInst.assertIsBoolean()
  return fieldInst.id === TRUE_ID
}

function width(evaluation: Evaluation): number {
  return getNumberFieldValueFrom(gameInstance(evaluation), evaluation, 'width')
}

function height(evaluation: Evaluation): number {
  return getNumberFieldValueFrom(gameInstance(evaluation), evaluation, 'height')
}

export function cellSize(evaluation: Evaluation): number {
  return getNumberFieldValueFrom(gameInstance(evaluation), evaluation, 'cellSize')
}

function ground(evaluation: Evaluation): string {
  return getStringFieldValueFrom(gameInstance(evaluation), evaluation, 'ground')
}

export function boardGround(evaluation: Evaluation): string | undefined {
  return getInstanceFieldFrom(gameInstance(evaluation), evaluation, 'boardGround') && getStringFieldValueFrom(gameInstance(evaluation), evaluation, 'boardGround')
}

function visuals(evaluation: Evaluation): Id[] {
  return getListFieldValueFrom(gameInstance(evaluation), evaluation, 'visuals')
}

function sounds(evaluation: Evaluation): Id[] {
  return getInstanceFieldFrom(gameInstance(evaluation), evaluation, 'sounds') ? getListFieldValueFrom(gameInstance(evaluation), evaluation, 'sounds') : []
}

export function gameStop(evaluation: Evaluation): boolean {
  return !getBooleanFieldValueFrom(gameInstance(evaluation), evaluation, 'running')
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

    return { text: message, time: messageTime }
  }
  else {
    return undefined
  }
}

export interface VisualState {
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

    const file = getStringFieldValueFrom(sound, evaluation, 'file')
    const status = getStringFieldValueFrom(sound, evaluation, 'status') as SoundStatus
    const volume = getNumberFieldValueFrom(sound, evaluation, 'volume')
    const loop = getBooleanFieldValueFrom(sound, evaluation, 'loop')

    return { id, file, status, volume, loop }
  })

}

export const canvasResolution = (evaluation: Evaluation): { x: number; y: number } => {
  const cellPixelSize = cellSize(evaluation)

  const pixelWidth = width(evaluation) * cellPixelSize
  const pixelHeight = height(evaluation) * cellPixelSize

  return {
    x: pixelWidth,
    y: pixelHeight,
  }
}