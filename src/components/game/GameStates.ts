import { Evaluation, RuntimeObject, Id, Execution, RuntimeValue } from 'wollok-ts'

const findByFQN = (fqn: string) => (evaluation: Evaluation) => {
  for (const obj of evaluation.allInstances()) {
    if (obj.module.fullyQualifiedName().startsWith(fqn)) return obj
  }
  throw new Error(`${fqn} instance not found`)
}

function* getPosition(evaluation: Evaluation, visual: RuntimeObject): Execution<RuntimeObject> {
  const position = visual.get('position')
  if (position) return position
  return (yield* evaluation.invoke('position', visual))!
}

function* getImage(evaluation: Evaluation, visual: RuntimeObject): Execution<RuntimeObject> {
  return (yield* evaluation.invoke('image', visual))!
}

export const io = findByFQN('wollok.io.io')
const mirror = findByFQN('wollok.gameMirror.gameMirror')
export const game = findByFQN('wollok.game.game')

function getInstanceFieldFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): RuntimeObject | undefined {
  return wObject.get(field)
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

function getListFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): RuntimeObject[] {
  const fieldInst: RuntimeObject = getInstanceFieldFrom(wObject, evaluation, field)!
  if (!fieldInst) return [] //TODO: Iniciar la colección de visuals en TS
  fieldInst.assertIsCollection()
  return fieldInst.innerValue
}

function getBooleanFieldValueFrom(wObject: RuntimeObject, evaluation: Evaluation, field: string): boolean {
  const fieldInst: RuntimeObject = getInstanceFieldFrom(wObject, evaluation, field)!
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
  return getInstanceFieldFrom(game(evaluation), evaluation, 'boardGround') && getStringFieldValueFrom(game(evaluation), evaluation, 'boardGround')
}

function visuals(evaluation: Evaluation): RuntimeObject[] {
  return getListFieldValueFrom(game(evaluation), evaluation, 'visuals')
}

function sounds(evaluation: Evaluation): RuntimeObject[] {
  return getInstanceFieldFrom(game(evaluation), evaluation, 'sounds') ? getListFieldValueFrom(game(evaluation), evaluation, 'sounds') : []
}

export function gameStop(evaluation: Evaluation): boolean {
  return !getBooleanFieldValueFrom(game(evaluation), evaluation, 'running')
}

export function* flushEvents(evaluation: Evaluation, ms: number): Execution<RuntimeValue> {
  const time = yield* evaluation.reify(ms)
  return yield* evaluation.invoke('flushEvents', mirror(evaluation), time)
}

const getVisualPosition = (visual: RuntimeObject) => function* (evaluation: Evaluation): Execution<{ x: number; y: number }> {
  const position = yield* getPosition(evaluation, visual)
  const wx: RuntimeObject = position.get('x')!
  wx.assertIsNumber()
  const x: number = Math.trunc(wx.innerValue)
  const wy: RuntimeObject = position.get('y')!
  wy.assertIsNumber()
  const y: number = Math.trunc(wy.innerValue)

  return { x, y }
}

const getVisualImage = (visual: RuntimeObject) => function* (evaluation: Evaluation): Execution<string> {
  if (visual.module.lookupMethod('image', 0)) {
    const wImage: RuntimeObject = yield* getImage(evaluation, visual)
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

export function* currentVisualStates(evaluation: Evaluation): Execution<VisualState[]> {
  const result: VisualState[] = []
  for (const visual of visuals(evaluation)) {
    const position = yield* getVisualPosition(visual)(evaluation)
    const image = yield* getVisualImage(visual)(evaluation)
    const message = getVisualMessage(visual)

    result.push({ position, image, message })
  }
  return result
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