import { RouteComponentProps } from '@reach/router'
import * as BrowserFS from 'browserfs'
import * as git from 'isomorphic-git'
import React, { memo, useEffect, useState } from 'react'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import $ from './Game.module.scss'
import Sketch from './Sketch'
import { gameInstance } from './Sketch'
import Spinner from './Spinner'

const natives = wre as Natives

const fetchFile = (path: string) => {
  return {
    name: 'game/' + path.split('/').pop(),
    content: BrowserFS.BFSRequire('fs').readFileSync(path)!.toString(),
  }
}

const chosenGame = {
  user: 'wollok',
  repo: 'pepitaGame',
}

const game = {
  main: 'game.pepitaGame.PepitaGame',
  sources: [
    'src/ciudades.wlk',
    'src/comidas.wlk',
    'src/pepita.wlk',
    'src/pepitaGame.wpgm',
  ],
  description: `
    - Presioná [↑] para ir hacia arriba.\n
    - Presioná [↓] para ir hacia abajo.\n
    - Presioná [←] para ir hacia la izquierda.\n
    - Presioná [→] para ir hacia la derecha.\n
    - Presioná [B] para ir a Buenos Aires.\n
    - Presioná [V] para ir a Villa Gesell.
  `,
  imagePaths: [''],
  assetSource: `https://raw.githubusercontent.com/${chosenGame.user}/${chosenGame.repo}/master/assets/`,
}



export type GameProps = RouteComponentProps
const Game = (_: GameProps) => {
  const [evaluation, setEvaluation] = useState<Evaluation>()

  useEffect(() => {
    BrowserFS.configure({ fs: 'InMemory', options: {} }, err => {
      if (err) return console.log(err)
      git.plugins.set('fs', BrowserFS.BFSRequire('fs')) // Reminder: move FS init if cloneRepository isnt here
      cloneRepository().then(() => {
        const files =  game.sources.map(fetchFile)
        const environment = buildEnvironment(files)
        const { buildEvaluation, runProgram } = interpret(environment, natives)
        const cleanEval = buildEvaluation()
        runProgram(game.main, cleanEval)
        setEvaluation(cleanEval)
      })
    })
  }, [])

  const title = evaluation ? evaluation.instances[gameInstance(evaluation).get('title')!.id].innerValue : ''

  return (
    <div className={$.container}>
      {evaluation
        ? <>
          <button onClick={cloneRepository}>Cargar</button>
          <h1>{title}</h1>
          <div>
            <Sketch game={game} evaluation={evaluation} />
            <div className={$.description}>
              {game.description.split('\n').map((line, i) =>
                <div key={i}>{line}</div>
              )}
            </div>
          </div>
        </>
        : <Spinner />
      }
    </div>
  )
}

export default memo(Game)


async function cloneRepository() {
  // const gameLocation = `${chosenGame.user}-${chosenGame.repo}`
  await git.clone({
    dir: '/',
    corsProxy: 'http://localhost:9999',
    url: `https://github.com/${chosenGame.user}/${chosenGame.repo}`,
    singleBranch: true,
    depth: 1,
  })
  setGame()
}

function setGame() {
  const srcDir = `src`
  const files  = BrowserFS.BFSRequire('fs').readdirSync(srcDir)
  const validSuffixes = ['wlk', 'wpgm']
  game.sources = files!
    .filter(file => validSuffixes
    .some(suffix => file.endsWith(`.${suffix}`)))
    .map(file => `${srcDir}/${file}`)
  game.imagePaths = BrowserFS.BFSRequire('fs').readdirSync(`assets`)
  game.assetSource = `https://raw.githubusercontent.com/${chosenGame.user}/${chosenGame.repo}/master/assets/`
}