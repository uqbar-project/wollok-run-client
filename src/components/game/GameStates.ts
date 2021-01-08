import { Evaluation, RuntimeObject } from 'wollok-ts'
import { Id } from 'wollok-ts'

export const io = (evaluation: Evaluation): Id => evaluation.environment.getNodeByFQN('wollok.io.io').id
const mirror = (evaluation: Evaluation) => evaluation.environment.getNodeByFQN('wollok.gameMirror.gameMirror').id
export const game = (evaluation: Evaluation): Id => evaluation.environment.getNodeByFQN('wollok.game.game').id
export const gameInstance = (evaluation: Evaluation): RuntimeObject => evaluation.instance(game(evaluation))

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
  return fieldInst === RuntimeObject.boolean(evaluation, true)
}

export function width(evaluation: Evaluation): number {
  return Math.round(getNumberFieldValueFrom(gameInstance(evaluation), evaluation, 'width'))
}

export function height(evaluation: Evaluation): number {
  return Math.round(getNumberFieldValueFrom(gameInstance(evaluation), evaluation, 'height'))
}

export function cellSize(evaluation: Evaluation): number {
  return getNumberFieldValueFrom(gameInstance(evaluation), evaluation, 'cellSize')
}

export function ground(evaluation: Evaluation): string {
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

export const flushEvents = (evaluation: Evaluation, ms: number): void => {
  const time = RuntimeObject.number(evaluation, ms)
  evaluation.invoke('flushEvents', evaluation.instance(mirror(evaluation)), time)
  evaluation.stepOut()
}

const getVisualPosition = (visual: RuntimeObject) => (evaluation: Evaluation) => {
  let position = visual.get('position')
  if (!position) {
    evaluation.invoke('position', visual)
    evaluation.stepOut()
    position = evaluation.currentFrame!.operandStack.pop()!
  }
  const wx: RuntimeObject = position.get('x')!
  wx.assertIsNumber()
  const x: number = Math.trunc(wx.innerValue)
  const wy: RuntimeObject = position.get('y')!
  wy.assertIsNumber()
  const y: number = Math.trunc(wy.innerValue)

  return { x, y }
}

const getVisualImage = (visual: RuntimeObject) => (evaluation: Evaluation): string => {
  const method = visual.module.lookupMethod('image', 0)
  if (method) {
    evaluation.invoke(method, visual)
    const wImage: RuntimeObject = evaluation.currentFrame!.operandStack.pop()!
    wImage.assertIsString()
    return wImage.innerValue
  } else {
    return 'wko.png'
  }
}

export interface VisualMessage {
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