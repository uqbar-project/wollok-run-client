import { RuntimeObject } from 'wollok-ts'
import { Interpreter } from 'wollok-ts/dist/interpreter/interpreter'

const { round } = Math

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

export function buildKeyPressEvent(interpreter: Interpreter, keyCode: string): RuntimeObject {
  return interpreter.list(
    interpreter.reify('keypress'),
    interpreter.reify(keyCode)
  )
}

export interface VisualState {
  image?: string;
  position: { x: number; y: number };
  message?: string;
}

export function visualState(interpreter: Interpreter, visual: RuntimeObject): VisualState {
  const imageMethod = visual.module.lookupMethod('image', 0)
  const image = imageMethod && interpreter.invoke(imageMethod, visual)!.innerString
  const position = visual.get('<position>') ?? interpreter.send('position', visual)!
  const x = position.get('x')!.innerNumber!
  const y = position.get('y')!.innerNumber!
  const message = visual.get('message')?.innerString
  return { image, position: { x, y }, message }
}

export function flushEvents(interpreter: Interpreter, ms: number): void {
  interpreter.send(
    'flushEvents',
    interpreter.object('wollok.gameMirror.gameMirror'),
    interpreter.reify(ms),
  )
}

export interface CanvasResolution {
  width: number;
  height: number;
}

export function canvasResolution(interpreter: Interpreter): CanvasResolution {
  const game = interpreter.object('wollok.game.game')
  const cellPixelSize = game.get('cellSize')!.innerNumber!
  const width = round(game.get('width')!.innerNumber!) * cellPixelSize
  const height = round(game.get('height')!.innerNumber!) * cellPixelSize
  return { width, height }
}

export function queueEvent(interpreter: Interpreter, ...events: RuntimeObject[]): void {
  const io = interpreter.object('wollok.io.io')
  events.forEach(e => interpreter.send('queueEvent', io, e))
}