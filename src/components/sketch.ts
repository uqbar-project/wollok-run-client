import * as p5 from 'p5'
// import 'p5/lib/addons/p5.sound'
import { Board } from './Game'

const imagePaths = [
  'agua.png',
  'capturaJuego.png',
  'desierto.jpg',
  'DonFuego.png',
  'DonRoca.png',
  'elementoRadioactivo.png',
  'fantasticos.jpg',
  'fire.gif',
  'pepita-grande.png',
  'pepita-gris.png',
  'pocionNaranja.png',
  'suelo.png',
  'thumbnail_12.png',
  'thumbnail_13.png',
  'thumbnail_14.png',
  'thumbnail_16.png',
  'thumbnail_1.png',
  'thumbnail_3.png',
  'thumbnail_44.png',
  'thumbnail_8.png',
  'tierra.jpg',
]
const cwd = 'games/2019-o-tpi-juego-loscuatrofantasticos'

const CELL_SIZE = 50

export default (board: Board) => (sketch: p5) => {
  const imgs: { [id: string]: p5.Image }  = { }

  sketch.setup = function setup() {
    sketch.createCanvas(500, 500)
    imagePaths.forEach((path: string) => {
      imgs[path] = sketch.loadImage(`${cwd}/assets/${path}`)
    })
  }

  sketch.draw = function draw() {
    sketch.background(300)
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        cell.forEach(({img}) => {
          sketch.image(imgs[img], x * CELL_SIZE, y * CELL_SIZE)
        })
      })
    })
  }

}