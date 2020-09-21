import 'p5/lib/addons/p5.sound'
import { Evaluation, interpret, WRENatives } from 'wollok-ts'
import { Board } from './utils'
import { RuntimeObject, TRUE_ID } from 'wollok-ts/dist/interpreter'
import { Id } from 'wollok-ts'

export const io = (evaluation: Evaluation) => evaluation.environment.getNodeByFQN('wollok.io.io').id

const gameInstance = (evaluation: Evaluation): RuntimeObject => {
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

function stringListGameFieldValue(evaluation: Evaluation, field: string): string[] {
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

function visuals(evaluation: Evaluation): string[] {
  return stringListGameFieldValue(evaluation, 'visuals')
}

function sounds(evaluation: Evaluation): string[] {
  return gameInstanceField(evaluation, 'sounds') ? stringListGameFieldValue(evaluation, 'sounds') : []
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

// interface VisualState {
//   position: {
//     x: any,
//     y: any
//   },
//   image: any,
//   message?: any
// }

export const currentVisualStates = (evaluation: Evaluation) => {
  const { sendMessage } = interpret(evaluation.environment, WRENatives)

  return visuals(evaluation).map((id: Id) => {
    const currentFrame = evaluation.currentFrame()!
    const visual = evaluation.instance(id)
    let position = visual.get('position')
    if (!position) {
      sendMessage('position', id)(evaluation)
      position = evaluation.instance(currentFrame.operandStack.pop()!)
    }
    const wx: RuntimeObject = evaluation.instance(position.get('x')!.id)
    wx.assertIsNumber()
    const x = wx.innerValue
    const wy: RuntimeObject = evaluation.instance(position.get('y')!.id)
    wy.assertIsNumber()
    const y = wy.innerValue

    let image
    if (visual.module().lookupMethod('image', 0)) {
      sendMessage('image', id)(evaluation)
      const wImage: RuntimeObject = evaluation.instance(currentFrame.operandStack.pop()!)
      wImage.assertIsString()
      image = wImage.innerValue
    } else {
      image = 'wko.png'
    }
    const actor = evaluation.instance(id)
    const wMessage: RuntimeObject | undefined = actor.get('message')
    const wMessageTime: RuntimeObject | undefined = actor.get('messageTime')
    // wMessage?.assertIsString()
    const text = wMessage ? wMessage.innerValue : undefined
    const message = text ? { text, time: wMessageTime ? wMessageTime.innerValue : undefined } : undefined
    return { position: { x, y }, image, message }
  })

}

export interface SoundState {
  id: Id,
  file: string,
  status: string,
  volume: number,
  loop: boolean
}

export const currentSoundStates = (evaluation: Evaluation): SoundState[] => {
  return sounds(evaluation).map((id: Id) => {
    const sound: RuntimeObject = evaluation.instance(id)
    const wFile: RuntimeObject = evaluation.instance(sound.get('file')!.id)
    wFile.assertIsString()
    const file = wFile.innerValue

    const wStatus: RuntimeObject = evaluation.instance(sound.get('status')!.id)
    wStatus.assertIsString()
    const status = wStatus.innerValue

    const wVolume: RuntimeObject = evaluation.instance(sound.get('volume')!.id)
    wVolume.assertIsNumber()
    const volume = wVolume.innerValue

    const wLoop: RuntimeObject = evaluation.instance(sound.get('loop')!.id)
    //wLoop.assertIsBoolean()
    const loop = wLoop.innerValue === TRUE_ID

    return { id, file, status, volume, loop }
  })

}