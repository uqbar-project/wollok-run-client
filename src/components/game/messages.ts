import p5 from 'p5'
import { cellSize } from './GameStates';

export interface DrawableMessage {
  message: string;
  x: number;
  y: number;
}

function messageSize(sketch: p5, message: DrawableMessage) {
  return { x: sketch.textWidth(message.message), y: sketch.textAscent() + 20 }
}

function drawMessageBackground(sketch: p5, message: DrawableMessage, cellSize: number) {
  const size = messageSize(sketch, message)
  sketch.rect(message.x + cellSize, message.y + sketch.textDescent() - cellSize, size.x, size.y, 20, 15, 10, 5)
}

export const drawMessage = (sketch: p5, cellSize: number) => (message: DrawableMessage): void => {
  drawMessageBackground(sketch, message, cellSize)
  sketch.text(message.message, message.x + cellSize, message.y - cellSize / 2)
}