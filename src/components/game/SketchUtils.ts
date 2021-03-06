import { Evaluation, Id, interpret, WRENatives } from 'wollok-ts'
import { io } from './GameStates'

export function wKeyCode(keyName: string, keyCode: number): string { //These keyCodes correspond to http://keycode.info/
  if (keyCode >= 48 && keyCode <= 57) return `Digit${keyName}` //Numbers (non numpad)
  if (keyCode >= 65 && keyCode <= 90) return `Key${keyName.toUpperCase()}` //Letters
  if (keyCode === 18) return 'AltLeft'
  if (keyCode === 225) return 'AltRight'
  if (keyCode === 8) return 'Backspace'
  if (keyCode === 17) return 'Control'
  if (keyCode === 46) return 'Delete'
  if (keyCode >= 37 && keyCode <= 40) return keyName //Arrows
  if (keyCode === 13) return 'Enter'
  if (keyCode === 189) return 'Minus'
  if (keyCode === 187) return 'Plus'
  if (keyCode === 191) return 'Slash'
  if (keyCode === 32) return 'Space'
  if (keyCode === 16) return 'Shift'
  return '' //If an unknown key is pressed, a string should be returned
}

export function buildKeyPressEvent(evaluation: Evaluation, keyCode: string): Id {
  const eventType = evaluation.createInstance('wollok.lang.String', 'keypress')
  const wKey = evaluation.createInstance('wollok.lang.String', keyCode)
  return evaluation.createInstance('wollok.lang.List', [eventType, wKey])
}

export function queueGameEvent(evaluation: Evaluation, eventId: string): void {
  const { sendMessage } = interpret(evaluation.environment, WRENatives)
  sendMessage('queueEvent', io(evaluation), eventId)(evaluation)
}