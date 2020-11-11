import p5 from 'p5'
import { cellSize } from './GameStates';

export interface DrawableMessage {
  message: string;
  x: number;
  y: number;
}

function messageSizeLimit(cellSize: number) {
  return { x: cellSize * 3, y: cellSize * 3 }
}

function messageTextPosition(message: DrawableMessage, cellSize: number) {
  return { x: message.x + cellSize, y: message.y - cellSize / 2 }
}

function messageSize(sketch: p5, message: DrawableMessage, cellSize: number) {
  const sizeLimit = messageSizeLimit(cellSize)
  const textWidth = sketch.textWidth(message.message)
  const xSize = Math.min(textWidth, sizeLimit.x)
  const ySize = cellSize * Math.ceil(textWidth / sizeLimit.y) / 2
  return { x: xSize, y: ySize }
}

function messageBackgroundPosition(sketch: p5, message: DrawableMessage, cellSize: number) {
  const xPosition = message.x + cellSize
  const yPosition = messageTextPosition(message, cellSize).y - sketch.textDescent()
  return { x: xPosition, y: yPosition }
}

function drawMessageBackground(sketch: p5, message: DrawableMessage, cellSize: number) {
  const size = messageSize(sketch, message, cellSize)
  const position = messageBackgroundPosition(sketch, message, cellSize)
  sketch.rect(position.x, position.y, size.x, size.y, 20, 15, 10, 5)
}

export const drawMessage = (sketch: p5, cellSize: number) => (message: DrawableMessage): void => {
  drawMessageBackground(sketch, message, cellSize)
  const position = messageTextPosition(message, cellSize)
  const limit = messageSizeLimit(cellSize)
  sketch.text(message.message, position.x, position.y, limit.x, limit.y)
}