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
import { PropertiesFile } from 'java-properties'
import PropertiesReader from 'properties-reader';

const natives = wre as Natives
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
const VALID_MEDIA_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
const GAME_DIR = 'game'
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'
const BUILD_PROPERTIES_FILE = "build.properties"

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
  assetsDir: string
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
  const gameRootPath = getGameRootPath()
  const allFiles = getAllFilePathsFrom(gameRootPath)
  const wpgmGame = allFiles.find((file: string) => file.endsWith(`.${WOLLOK_PROGRAM_EXTENSION}`))
  if (!wpgmGame) throw new Error('Program not found')
  const main = `game.${wpgmGame.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '')}`
  const sources = filesWithValidSuffixes(allFiles, EXPECTED_WOLLOK_EXTENSIONS)
  const assetSource = `https://raw.githubusercontent.com/${repoUri}/master/`
  const gameAssetsPaths = filesWithValidSuffixes(allFiles, VALID_MEDIA_EXTENSIONS).map(path => assetSource + path.substr(gameRootPath.length + 1))
  const assetFolderName = gameAssetsPaths[0]?.substring(assetSource.length).split('/')[0]
  const assetsDir = assetSource + assetFolderName + '/'
  const imagePaths = gameAssetsPaths.concat(defaultImagesNeededFor(gameAssetsPaths))

  let description
  try {
    description = BrowserFS.BFSRequire('fs').readFileSync(`${gameRootPath}/README.md`).toString()
  } catch {
    description = '## No description found'
  }
  return { main, sources, description, imagePaths, assetsDir }
}

function getSourceFoldersNames(): string[] {
  const propertiesContent = BrowserFS.BFSRequire('fs').readFileSync(getBuildPropertiesPath(), "utf-8")
  const properties = PropertiesReader('').read(propertiesContent)
  return properties.getRaw("source..")!.split(",")
}
function getGameRootPath(): string {
  return getBuildPropertiesPath().split(`/${BUILD_PROPERTIES_FILE}`)[0]
}

function getBuildPropertiesPath(): string {
  const allFiles = getAllFilePathsFrom(GAME_DIR, ["properties"])
  return allFiles.find((filePath: string) => filePath.endsWith(`/${BUILD_PROPERTIES_FILE}`))!
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