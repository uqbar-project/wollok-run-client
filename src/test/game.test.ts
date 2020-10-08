import fs from 'fs'
import { boardToLayers } from '../components/game/utils'
import { buildEnvironment, interpret } from 'wollok-ts/dist'
import wre from 'wollok-ts/dist/wre/wre.natives'
import { nextBoard } from '../components/game/GameStates'


describe('game', () => {
  const ground1 = { img: 'ground1' }
  const ground2 = { img: 'ground2' }
  const pepita2 = { img: 'pepita2' }
  const pepita3 = { img: 'pepita3' }

  const board = [
    [[ground1], [ground1, pepita2], [ground1]],
    [[ground2], [ground2, pepita2, pepita3], [ground2]],
  ]

  test('board to layers', () => {
    const layers = boardToLayers(board)
    expect(layers).toEqual([
      [
        [ground1, ground1, ground1],
        [ground2, ground2, ground2],
      ],
      [
        [undefined, pepita2, undefined],
        [undefined, pepita2, undefined],
      ],
      [
        undefined,
        [undefined, pepita3, undefined],
      ],
    ])
  })

  test('out test', () => {
    const environment = buildEnvironment(readFiles('games/gameTest.wpgm'))
    const { buildEvaluation, runProgram } = interpret(environment, wre)
    const evaluation = buildEvaluation()
    runProgram('games.gameTest.mockGame', evaluation)
    const [[visuals]] = nextBoard(evaluation)
    expect(visuals).toContainEqual({ img: 'in.png' })
    expect(visuals).not.toContainEqual({ img: 'out.png' })
  })

})


const readFiles = (...files: string[]) => files.map(file => ({
  name: file,
  content: fs.readFileSync(`src/test/${file}`, 'utf8'),
}))