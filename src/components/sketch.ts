import * as p5 from 'p5'
// import 'p5/lib/addons/p5.sound'
import { Evaluation, Id, interpret } from 'wollok-ts/dist'
import { RuntimeObject } from 'wollok-ts/dist/interpreter'
import natives from 'wollok-ts/dist/wre/wre.natives'

type Cell = {img: string, dialog?: any}
type Board = Cell[][][]

const CELL_SIZE = 50

export const gameInstance = ({ environment, instances }: Evaluation) => {
  return instances[environment.getNodeByFQN('wollok.game.game').id]
}

const emptyBoard = (evaluation: Evaluation): Board => {
  const gameInst = gameInstance(evaluation)
  const width = evaluation.instance(gameInst.get('width')!.id).innerValue
  const height = evaluation.instance(gameInst.get('height')!.id).innerValue
  const ground = evaluation.instance(gameInst.get('ground')!.id) &&
    `${evaluation.instance(gameInst.get('ground')!.id).innerValue}`
  return Array.from(Array(height), () =>
    Array.from(Array(width), () => ground ? [{img: ground}] : [])
  )
}

const flushEvents = (evaluation: Evaluation, initTime: Date): void => {
  const { sendMessage } = interpret(evaluation.environment, natives)

  const io = evaluation.environment.getNodeByFQN('wollok.lang.io').id

  // const wDebug = evaluation.instance(io).get('dialog')
  // const debug = wDebug ? (wDebug.innerValue as string) : undefined
  // console.log(debug)

  const t = new Date().getTime() - initTime.getTime()
  const time = evaluation.createInstance('wollok.lang.Number', t)
  sendMessage('flushEvents', io, time)(evaluation)
}
// interface VisualState {
//   position: {
//     x: any,
//     y: any
//   },
//   image: any,
//   dialog?: any
// }

const currentVisualStates = (evaluation: Evaluation) => {
  const { sendMessage } = interpret(evaluation.environment, natives)

  const wVisuals: RuntimeObject = evaluation.instances[gameInstance(evaluation).get('visuals')!.id]
  wVisuals.assertIsCollection()
  const visuals = wVisuals.innerValue
  return visuals.map((id: Id) => {
    const currentFrame = evaluation.frameStack[evaluation.frameStack.length - 1]

    sendMessage('position', id)(evaluation)
    const position = evaluation.instances[currentFrame.operandStack.pop()!]
    const wx: RuntimeObject = evaluation.instance(position.get('x')!.id)
    wx.assertIsNumber()
    const x = wx.innerValue
    const wy: RuntimeObject = evaluation.instance(position.get('y')!.id)
    wy.assertIsNumber()
    const y = wy.innerValue

    sendMessage('image', id)(evaluation)
    const wImage: RuntimeObject = evaluation.instances[currentFrame.operandStack.pop()!]
    wImage.assertIsString()
    const image = wImage.innerValue
    const wDialog: RuntimeObject | undefined = evaluation.instance(id).get('dialog')
    // wDialog?.assertIsString()
    const dialog = wDialog ? wDialog.innerValue : undefined

    return { position: { x, y }, image, dialog }
  })


}

export default (game: { imagePaths: string[]; cwd: string }, evaluation: Evaluation) => (sketch: p5) => {
  const imgs: { [id: string]: p5.Image }  = { }
  let board: Board
  let initTime: Date

  sketch.setup = () => {
    initTime = new Date()
    sketch.createCanvas(500, 500)
    loadImages()
  }

  function loadImages() {
    game.imagePaths.forEach((path: string) => {
      imgs[path] = sketch.loadImage(`${game.cwd}/assets/${path}`)
    })
  }

  sketch.draw = () => {
    if (!evaluation) return
    flushEvents(evaluation, initTime)
    updateBoard()
    drawBoard()
  }

  function updateBoard() {
    const current = JSON.stringify(board)
    const next = emptyBoard(evaluation)
    for (const { position: { x, y }, image, dialog } of currentVisualStates(evaluation)) {
      next[y][x].push({img: `${image}`, dialog})
    }
    if (JSON.stringify(next) !== current) board = next
  }

  function drawBoard() {
    sketch.background(300)
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        cell.forEach(({img}) => {
          sketch.image(imgs[img], x * CELL_SIZE, y * CELL_SIZE)
        })
      })
    })
  }


  // TODO: Use p5
  // useEventListener<KeyboardEvent>('keydown', (event: any) => {
  //   if (!evaluation) return

  //   event.preventDefault()

  //   const left = evaluation.createInstance('wollok.lang.String', 'keydown')
  //   const right = evaluation.createInstance( 'wollok.lang.String', event.code)
  //   const id = evaluation.createInstance('wollok.lang.List', [left, right])

  //   const { sendMessage } = interpret(evaluation.environment, natives)
  //   sendMessage('queueEvent', evaluation.environment.getNodeByFQN('wollok.lang.io').id, id)(evaluation)

  //   setEvaluation(evaluation)
  // })

}