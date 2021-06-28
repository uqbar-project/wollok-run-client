import { Evaluation, RuntimeObject, Id, Execution } from 'wollok-ts'

export const findByFQN = (fqn: string) => (evaluation: Evaluation) => evaluation.rootContext.get(fqn)!

export const game = findByFQN('wollok.game.game')

export function getNumberFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): number {
  const fieldInst: RuntimeObject = wObject.get(field)!
  fieldInst.assertIsNumber()
  return fieldInst.innerValue
}

function getStringFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): string {
  const fieldInst: RuntimeObject = wObject.get(field)!
  fieldInst.assertIsString()
  return fieldInst.innerValue
}

function getListFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): RuntimeObject[] {
  const fieldInst: RuntimeObject = wObject.get(field)!
  if (!fieldInst) return [] //TODO: Iniciar la colección de visuals en TS
  fieldInst.assertIsCollection()
  return fieldInst.innerValue
}

function getBooleanFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): boolean {
  const fieldInst: RuntimeObject = wObject.get(field)!
  fieldInst.assertIsBoolean()
  return fieldInst.innerValue
}

export function width(evaluation: Evaluation): number {
  return Math.round(getNumberFieldValueFrom(game(evaluation), evaluation, 'width'))
}

export function height(evaluation: Evaluation): number {
  return Math.round(getNumberFieldValueFrom(game(evaluation), evaluation, 'height'))
}

export function cellSize(evaluation: Evaluation): number {
  return getNumberFieldValueFrom(game(evaluation), evaluation, 'cellSize')
}

export function ground(evaluation: Evaluation): string {
  return getStringFieldValueFrom(game(evaluation), evaluation, 'ground')
}

export function boardGround(evaluation: Evaluation): string | undefined {
  return game(evaluation).get('boardGround') && getStringFieldValueFrom(game(evaluation), evaluation, 'boardGround')
}

export function visuals(evaluation: Evaluation): RuntimeObject[] {
  return getListFieldValueFrom(game(evaluation), evaluation, 'visuals')
}

function sounds(evaluation: Evaluation): RuntimeObject[] {
  return game(evaluation).get('sounds') ? getListFieldValueFrom(game(evaluation), evaluation, 'sounds') : []
}

export function gameStop(evaluation: Evaluation): boolean {
  return !getBooleanFieldValueFrom(game(evaluation), evaluation, 'running')
}

export const getVisualImage = (visual: RuntimeObject) => function* (evaluation: Evaluation): Execution<string> {
  if (visual.module.lookupMethod('image', 0)) {
    const wImage: RuntimeObject = (yield* evaluation.invoke('image', visual))!
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

export const getVisualMessage = (visual: RuntimeObject): VisualMessage | undefined => {
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

type SoundStatus = 'played' | 'paused' | 'stopped'
export interface SoundState {
  id: Id;
  file: string;
  status: SoundStatus;
  volume: number;
  loop: boolean;
}

export const currentSoundStates = (evaluation: Evaluation): SoundState[] => {
  return sounds(evaluation).map((sound: RuntimeObject) => {
    const file = getStringFieldValueFrom(sound, evaluation, 'file')
    const status = getStringFieldValueFrom(sound, evaluation, 'status') as SoundStatus
    const volume = getNumberFieldValueFrom(sound, evaluation, 'volume')
    const loop = getBooleanFieldValueFrom(sound, evaluation, 'loop')

    return { id: sound.id, file, status, volume, loop }
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