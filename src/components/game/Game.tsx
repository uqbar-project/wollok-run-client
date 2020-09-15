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
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
const VALID_SOUND_EXTENSIONS = ['mp3', 'ogg', 'wav']
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
  imagePaths: string[]
  soundPaths: string[]
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
      const mainWollokProgramName = programWollokFile.members.find(entity => entity.is('Program'))?.name
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
  DEFAULT_GAME_ASSETS_DIR + 'ground.png',
  DEFAULT_GAME_ASSETS_DIR + 'wko.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech2.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech3.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech4.png',
]

function buildGameProject(repoUri: string): GameProject {
  const files = BrowserFS.BFSRequire('fs').readdirSync(`${GAME_DIR}/${SRC_DIR}`)
  const wpgmGame = files.find((file: string) => file.endsWith(`.${WOLLOK_PROGRAM_EXTENSION}`))
  if (!wpgmGame) throw new Error('Program not found')
  const main = `game.${wpgmGame.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '')}`
  const assetSource = `https://raw.githubusercontent.com/${repoUri}/master/`
  const sources = getAllFilePathsFrom(GAME_DIR, EXPECTED_WOLLOK_EXTENSIONS)
  const gameAssetsPaths = getAllMediaPathsWithExtension(assetSource, VALID_IMAGE_EXTENSIONS)
  const imagePaths = gameAssetsPaths.concat(defaultImagesNeededFor(gameAssetsPaths))
  const soundPaths = getAllMediaPathsWithExtension(assetSource, VALID_SOUND_EXTENSIONS)

  let description
  try {
    description = BrowserFS.BFSRequire('fs').readFileSync(`${GAME_DIR}/README.md`).toString()
  } catch {
    description = '## No description found'
  }
  return { main, sources, description, imagePaths, soundPaths }
}

function getAllMediaPathsWithExtension(assetSource: string, mediaExtension: string[]): string[] {
  return getAllFilePathsFrom(GAME_DIR, mediaExtension).map(path => assetSource + path.substr(GAME_DIR.length + 1))
}

function defaultImagesNeededFor(imagePaths: string[]): string[] {
  const imageNameInPath = (path: string) => { return path.split('/').pop()! }
  const knownImageNames = imagePaths.map(path => imageNameInPath(path))
  return defaultImgs.filter(defaultImg => !knownImageNames.includes(imageNameInPath(defaultImg)))
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