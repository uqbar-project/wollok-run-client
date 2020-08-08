import { RouteComponentProps } from '@reach/router'
import * as BrowserFS from 'browserfs'
import * as git from 'isomorphic-git'
import React, { memo, useEffect, useState } from 'react'
import { buildEnvironment, Evaluation, interpret, Package } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import $ from './Game.module.scss'
import GameSelector from './GameSelector'
import Sketch from './Sketch'
import { gameInstance } from './Sketch'
import Spinner from './Spinner'

const natives = wre as Natives
const SRC_DIR = `src`
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]

const fetchFile = (path: string) => {
  return {
    name: 'game/' + path.split('/').pop(),
    content: BrowserFS.BFSRequire('fs').readFileSync(path)!.toString(),
  }
}

export interface GameProject {
  main: string
  sources: string[]
  description: string
  imagePaths: string[]
  assetSource: string
}


export type GameProps = RouteComponentProps
const Game = (props: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const repoUri = new URLSearchParams(props.location!.search).get('github')

  useEffect(() => {
    BrowserFS.configure({ fs: 'InMemory', options: {} }, err => {
      if (err) throw new Error('FS error')
      git.plugins.set('fs', BrowserFS.BFSRequire('fs')) // Reminder: move FS init if cloneRepository isnt here
      if (repoUri) loadGame(repoUri)
    })
  }, [repoUri])

  const loadGame = (uri: string) => {
    cloneRepository(uri).then((project: GameProject) => {
      const files = project.sources.map(fetchFile)
      const environment = buildEnvironment(files)
      const programWollokFile = environment.getNodeByFQN<Package>(`${project.main}`)
      const mainWollokProgramName = programWollokFile.members[0].name
      const { buildEvaluation, runProgram } = interpret(environment, natives)
      const cleanEval = buildEvaluation()
      runProgram(`${project.main}.${mainWollokProgramName}`, cleanEval)
      setGame(project)
      setEvaluation(cleanEval)
    })
  }

  const title = evaluation ? evaluation.instances[gameInstance(evaluation).get('title')!.id].innerValue : ''

  return (
    <div className={$.container}>
      {!evaluation || !game
        ? !repoUri
          ? <GameSelector />
          : <Spinner />
        : <>
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
      }
    </div>
  )
}

export default memo(Game)


async function cloneRepository(repoUri: string) {
  await git.clone({
    dir: '/',
    corsProxy: 'http://localhost:9999',
    url: `https://github.com/${repoUri}`,
    singleBranch: true,
    depth: 1,
  })
  return buildGameProject(repoUri)
}

function buildGameProject(repoUri: string): GameProject {
  const files = BrowserFS.BFSRequire('fs').readdirSync(SRC_DIR)
  const wpgmGame = files.find(file => file.endsWith(`.${WOLLOK_PROGRAM_EXTENSION}`))
  if (!wpgmGame) throw new Error('Program not found')
  const main = `game.${wpgmGame.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '')}`
  const sources = files
    .filter(file => EXPECTED_WOLLOK_EXTENSIONS.some(suffix => file.endsWith(`.${suffix}`)))
    .map(file => `${SRC_DIR}/${file}`)
  const imagePaths = BrowserFS.BFSRequire('fs').readdirSync(`assets`)
  const assetSource = `https://raw.githubusercontent.com/${repoUri}/master/assets/`
  const description = '' // TODO: Load README
  return { main, sources, imagePaths, assetSource, description }
}