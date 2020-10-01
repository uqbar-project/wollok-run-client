import fs from 'fs'
import { boardToLayers } from '../components/game/utils'
import { buildEnvironment } from 'wollok-ts'

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
    const environment = buildEnvironment([readFile('games/gameTest.wpgm')])
    // console.log(environment)
    const programWollokFile = environment.getNodeByFQN<'Package'>('games.gameTest')
    const { name } = programWollokFile.members.find(entity => entity.is('Program'))!
    expect(name).toEqual('mockGame')
  })

})

const readFile = (file: string) => ({
  name: file,
  content: fs.readFileSync(`src/test/${file}`, 'utf8'),
})