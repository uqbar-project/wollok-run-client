import p5 from 'p5'

export interface DrawableMessage {
  message: string;
  x: number;
  y: number;
}

const sizeFactor = 50

function messageSizeLimit() {
  return { x: sizeFactor * 3, y: sizeFactor * 3 }
}

function xPositionIsOutOfCanvas(sketch: p5, xPosition: number, width: number) {
  return xPosition + width > sketch.width
}

function messageXPosition(sketch: p5, message: DrawableMessage) {
  const xPos = message.x + sizeFactor
  const width = messageSize(sketch, message).x
  const inverseXPos = message.x - width

  return xPositionIsOutOfCanvas(sketch, xPos, width) ? inverseXPos : xPos
}

function yPositionIsOutOfCanvas(yPosition: number) {
  return yPosition < 0
}

function messageYPosition(sketch: p5, message: DrawableMessage) {
  const messageSizeOffset = messageSize(sketch, message).y * 1.05
  const yPos = message.y - messageSizeOffset
  const inverseYPos = message.y + sizeFactor

  return yPositionIsOutOfCanvas(yPos) ? inverseYPos : yPos
}

function messageTextPosition(sketch: p5, message: DrawableMessage) {
  return { x: messageXPosition(sketch, message), y: messageYPosition(sketch, message) }
}

function messageSize(sketch: p5, message: DrawableMessage) {
  const sizeLimit = messageSizeLimit()
  const textWidth = sketch.textWidth(message.message)
  const xSize = Math.min(textWidth, sizeLimit.x)
  const ySize = Math.min((sizeFactor - 15) * Math.ceil(textWidth / sizeLimit.x) / 2, sizeLimit.y)
  return { x: xSize, y: ySize }
}

function messageBackgroundPosition(sketch: p5, message: DrawableMessage) {
  const xPosition = messageTextPosition(sketch, message).x - 5
  const yPosition = messageTextPosition(sketch, message).y
  return { x: xPosition, y: yPosition }
}

function drawMessageBackground(sketch: p5, message: DrawableMessage) {
  const size = messageSize(sketch, message)
  const position = messageBackgroundPosition(sketch, message)
  sketch.rect(position.x, position.y, size.x + 10, size.y, 20, 15, 10, 5)
}

export const drawMessage = (sketch: p5) => (message: DrawableMessage): void => {
  drawMessageBackground(sketch, message)
  const position = messageTextPosition(sketch, message)
  const limit = messageSizeLimit()
  sketch.text(message.message, position.x, position.y, limit.x, limit.y)
}