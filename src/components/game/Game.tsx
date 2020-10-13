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
import Sketch from './Sketch'
import parse, { Attributes } from 'xml-parser'
import { gameInstance } from './GameStates'

const natives = wre as Natives
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
const VALID_SOUND_EXTENSIONS = ['mp3', 'ogg', 'wav']
const GAME_DIR = 'game'
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'
const CLASS_PATH_FILE = '.classpath'

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
  sourcePaths: string[]
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
  const gameRootPath: string = getGameRootPath()
  const sourceFolders: string[] = getSourceFoldersNames()
  const allFiles: string[] = sourceFolders.flatMap((source: string) => getAllFilePathsFrom(`${gameRootPath}/${source}`))
  const wpgmGame = allFiles.find((file: string) => file.endsWith(`.${WOLLOK_PROGRAM_EXTENSION}`))
  if (!wpgmGame) throw new Error('Program not found')
  const main = `game.${wpgmGame.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').split('/').pop()}` //Ahora es un hackazo esto maso, revisar
  const sources: string[] = filesWithValidSuffixes(allFiles, EXPECTED_WOLLOK_EXTENSIONS)
  const rootPath = `https://raw.githubusercontent.com/${repoUri}/master/`
  const gameAssetsPaths = filesWithValidSuffixes(allFiles, VALID_IMAGE_EXTENSIONS).map(path => rootPath + path.substr(gameRootPath.length + 1))
  const soundPaths = filesWithValidSuffixes(allFiles, VALID_SOUND_EXTENSIONS).map(path => rootPath + path.substr(gameRootPath.length + 1))
  const imagePaths = gameAssetsPaths.concat(defaultImagesNeededFor(gameAssetsPaths))
  const sourcePaths = sourceFolders.map((source: string) => rootPath + source)

  let description
  try {
    description = BrowserFS.BFSRequire('fs').readFileSync(`${gameRootPath}/README.md`).toString()
  } catch {
    description = '## No description found'
  }
  return { main, sources, description, imagePaths, soundPaths, sourcePaths }
}

function getSourceFoldersNames(): string[] {
  const classPathContent: string = BrowserFS.BFSRequire('fs').readFileSync(getClassPathPath(), 'utf-8')
  const document: parse.Document = parse(classPathContent)
  const documentAttributes: Attributes[] = document.root.children.map(child => child.attributes)
  return documentAttributes.filter((attribute: Attributes) => attribute.kind === 'src').map((attribute: Attributes) => attribute.path)
}

function getGameRootPath(): string {
  return getClassPathPath().split(`/${CLASS_PATH_FILE}`)[0]
}

function getClassPathPath(): string {
  const allFiles = getAllFilePathsFrom(GAME_DIR, ['classpath'])
  return allFiles.find((filePath: string) => filePath.endsWith(`/${CLASS_PATH_FILE}`))!
}

function defaultImagesNeededFor(imagePaths: string[]): string[] {
  const imageNameInPath = (path: string) => { return path.split('/').pop()! }
  const knownImageNames = imagePaths.map(path => imageNameInPath(path))
  return defaultImgs.filter(defaultImg => !knownImageNames.includes(imageNameInPath(defaultImg)))
}

function filesWithValidSuffixes(files: string[], validSuffixes: string[]): string[] {
  return files.filter((file: string) => validSuffixes.some(suffix => file.endsWith(`.${suffix}`)))
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
  return validSuffixes ? filesWithValidSuffixes(allFiles, validSuffixes) : allFiles
}