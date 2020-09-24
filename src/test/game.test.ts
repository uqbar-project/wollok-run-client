import { boardToLayers } from '../components/game/utils'
import { buildEnvironment } from 'wollok-ts'
import { buildInterpreter } from '../../../wollok-ts/test/assertions';
import FS from 'browserfs/dist/node/core/FS';
import BrowserFS from 'browserfs';

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
      ]
    ])
  })

  test('out test', () => {
    const interpreter = buildInterpreter("**/*.wpgm", "./src/test")
    const evaluation = interpreter.buildEvaluation()
    const environment = evaluation.environment
    console.log(environment)
    const programWollokFile = environment.getNodeByFQN<'Package'>(`games.gameTest`)
    const mainWollokProgramName = programWollokFile.members.find(entity => entity.is('Program'))?.name
    console.log(mainWollokProgramName)
  })

})
