import { Evaluation, Execution, RuntimeObject, RuntimeValue } from 'wollok-ts'

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

export function* buildKeyPressEvent(evaluation: Evaluation, keyCode: string): Execution<RuntimeObject> {
  const eventType = yield* evaluation.reify('keypress')
  const wKey = yield* evaluation.reify(keyCode)
  return yield* evaluation.list(eventType, wKey)
}

export function queueGameEvent(evaluation: Evaluation, event: RuntimeObject): Execution<RuntimeValue> {
  return evaluation.invoke('queueEvent', evaluation.object('wollok.io.io'), event)
}