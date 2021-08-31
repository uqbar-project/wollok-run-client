import p5 from 'p5'
import { RuntimeObject } from 'wollok-ts'
import { Interpreter } from 'wollok-ts/dist/interpreter/interpreter'
import { TEXT_SIZE, TEXT_STYLE } from './messages'

const { round } = Math

function invokeMethod(interpreter: Interpreter, visual: RuntimeObject, method: string) {
  const lookedUpMethod = visual.module.lookupMethod(method, 0)
  return lookedUpMethod && interpreter.invoke(lookedUpMethod, visual)!.innerString
}

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
  position: Position;
  message?: string;
  text?: string;
  textColor?: string;
}
export interface Position {
  x: number;
  y: number;
}

export function draw(sketch: p5, drawable: Drawable){
  if(drawable.drawableImage){
    const {drawableImage: {image, position: {x, y}}} = drawable
    sketch.image(image, x, y)
  }
  if(drawable.drawableText){
    write(sketch, drawable.drawableText)
  }
}

export function write(sketch: p5, drawableText: DrawableText) {
  const defaultTextColor = 'blue'
  const grey = '#1c1c1c'
  const hAlign = drawableText.horizAlign || 'center'
  const vAlign = drawableText.vertAlign || 'center'
  const x = drawableText.position.x
  const y = drawableText.position.y
  sketch.textSize(drawableText.size || TEXT_SIZE)
  sketch.textStyle(drawableText.style || TEXT_STYLE)
  sketch.textAlign(hAlign, vAlign)
  sketch.stroke(grey)
  sketch.fill(drawableText.color || defaultTextColor)
  sketch.text(drawableText.text, x, y)
}

//const image = (path?: string): p5.Image => (path && images.get(path)) || images.get('wko.png')!
export function baseDrawable(images: Map<string, p5.Image>, path?: string, mustSearchImage = true): Drawable {
  const origin: Position = {x: 0, y: 0}
  const p5Image = path && images.get(path)

  if(!mustSearchImage){
    return {}
  }

  if(!p5Image){
    const drawableText = {color: 'black', horizAlign: p5.prototype.LEFT,
    vertAlign: p5.prototype.TOP, text: 'IMAGE\n  NOT\nFOUND', position: origin}
    return {drawableImage: {image: images.get('wko.png')!, position: origin}, drawableText}
  }

  return {drawableImage: {image: p5Image, position: origin}}
}

export function hexaToColor(textColor?: string) { return !textColor ? undefined : '#' + textColor }

export interface Drawable {
  drawableImage?: DrawableImage;
  drawableText?: DrawableText;
}

export interface DrawableImage {
  image: p5.Image;
  position: Position;
}

export interface DrawableText {
  position: Position;
  text: string;
  color?: string;
  size?: number;
  horizAlign?: p5.HORIZ_ALIGN;
  vertAlign?: p5.VERT_ALIGN;
  style?: p5.THE_STYLE;  
}

export function visualState(interpreter: Interpreter, visual: RuntimeObject): VisualState {
  const image = invokeMethod(interpreter, visual, 'image')
  const text = invokeMethod(interpreter, visual, 'text')
  const textColor = invokeMethod(interpreter, visual, 'textColor')
  const position = interpreter.send('position', visual)!
  const roundedPosition = interpreter.send('round', position)!
  const x = roundedPosition.get('x')!.innerNumber!
  const y = roundedPosition.get('y')!.innerNumber!
  const message = visual.get('message')?.innerString
  return { image, position: { x, y }, text, textColor, message }
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