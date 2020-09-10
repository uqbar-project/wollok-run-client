import { RouteComponentProps } from '@reach/router'
import * as BrowserFS from 'browserfs'
import * as git from 'isomorphic-git'
import React, { memo, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import Spinner from '../Spinner'
import $ from './Game.module.scss'
import GameSelector from './GameSelector'
import Sketch, { gameInstance } from './Sketch'

const natives = wre as Natives
const SRC_DIR = 'src'
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
const VALID_MEDIA_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
const GAME_DIR = 'game'
const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'

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
  defaultPaths: string[][]
  imagePaths: string[]
  assetSource: string
}


export type GameProps = RouteComponentProps
const Game = (props: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()
  const repoUri = new URLSearchParams(props.location!.search).get('github')

  useEffect(() => {
    BrowserFS.configure({ fs: 'InMemory', options: {} }, (err: any) => {
      if (err) throw new Error('FS error')
      git.plugins.set('fs', BrowserFS.BFSRequire('fs')) // Reminder: move FS init if cloneRepository isnt here
      if (repoUri) loadGame(repoUri)
    })
  }, [repoUri])

  const loadGame = (uri: string) => {
    cloneRepository(uri).then((project: GameProject) => {
      const files = project.sources.map(fetchFile)
      const environment = buildEnvironment(files)
      const programWollokFile = environment.getNodeByFQN<'Package'>(`${project.main}`)
      const mainWollokProgramName = programWollokFile.members[0].name
      const { buildEvaluation, runProgram } = interpret(environment, natives)
      const cleanEval = buildEvaluation()
      runProgram(`${project.main}.${mainWollokProgramName}`, cleanEval)
      setGame(project)
      setEvaluation(cleanEval)
    })
  }

  const title = evaluation ? evaluation.instance(gameInstance(evaluation).get('title')!.id).innerValue : ''

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
            <ReactMarkdown source={game.description} className={$.description} />
          </div>
        </>
      }
    </div>
  )
}

export default memo(Game)


async function cloneRepository(repoUri: string) {
  await git.clone({
    dir: GAME_DIR,
    corsProxy: 'http://localhost:9999',
    url: `https://github.com/${repoUri}`,
    singleBranch: true,
    depth: 1,
  })
  return buildGameProject(repoUri)
}

const defaultImgs = [
  ['ground.png', DEFAULT_GAME_ASSETS_DIR + 'ground.png'],
  ['wko.png', DEFAULT_GAME_ASSETS_DIR + 'wko.png'],
  ['speech.png', DEFAULT_GAME_ASSETS_DIR + 'speech.png'],
  ['speech2.png', DEFAULT_GAME_ASSETS_DIR + 'speech2.png'],
  ['speech3.png', DEFAULT_GAME_ASSETS_DIR + 'speech3.png'],
  ['speech4.png', DEFAULT_GAME_ASSETS_DIR + 'speech4.png'],
]

function buildGameProject(repoUri: string): GameProject {
  const files = BrowserFS.BFSRequire('fs').readdirSync(`${GAME_DIR}/${SRC_DIR}`)
  const wpgmGame = files.find((file: string) => file.endsWith(`.${WOLLOK_PROGRAM_EXTENSION}`))
  if (!wpgmGame) throw new Error('Program not found')
  const main = `game.${wpgmGame.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '')}`
  const sources = getAllFilePathsFrom(GAME_DIR, EXPECTED_WOLLOK_EXTENSIONS)
  const imagePaths = getAllFilePathsFrom(GAME_DIR, VALID_MEDIA_EXTENSIONS).map(path => path.substr(GAME_DIR.length + 1))
  const defaultPaths = defaultImgs
  const assetSource = `https://raw.githubusercontent.com/${repoUri}/master/`
  let description
  try {
    description = BrowserFS.BFSRequire('fs').readFileSync(`${GAME_DIR}/README.md`).toString()
  } catch {
    description = '## No description found'
  }
  return { main, sources, description, defaultPaths, imagePaths, assetSource }
}

function getAllFilePathsFrom(parentDirectory: string, validSuffixes?: string[]): string[] {
  const browserFS = BrowserFS.BFSRequire('fs')
  const allFiles = browserFS
    .readdirSync(parentDirectory)
    .map((directoryEntry: string) => {
      const fullPath = `${parentDirectory}/${directoryEntry}`
      return browserFS.statSync(fullPath).isDirectory() ?
        getAllFilePathsFrom(fullPath, validSuffixes) : fullPath
    })
    .flat()
  return validSuffixes ?
    allFiles.filter((file: string) => validSuffixes!.some(suffix => file.endsWith(`.${suffix}`))) :
    allFiles
}