import { RouteComponentProps } from '@reach/router'
import React, { memo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { buildEnvironment, Evaluation, interpret } from 'wollok-ts/dist'
import { Natives } from 'wollok-ts/dist/interpreter'
import wre from 'wollok-ts/dist/wre/wre.natives'
import FilesSelector, { File } from '../filesSelector/FilesSelector'
import Sketch from './Sketch'
import $ from './Game.module.scss'
import { gameInstance } from './GameStates'

const natives = wre as Natives
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'

type SourceFile = {
  name: string
  content: string
}

export interface GameProject {
  main: string
  sources: SourceFile[]
  description: string
  imagePaths: string[]
  assetsDir: string
}


export type GameProps = RouteComponentProps
const Game = (props: GameProps) => {
  const [game, setGame] = useState<GameProject>()
  const [evaluation, setEvaluation] = useState<Evaluation>()

  const loadGame = (files: File[]) => {
    const project = buildGameProject(files)
    const environment = buildEnvironment(project.sources)
    const programWollokFile = environment.getNodeByFQN<'Package'>(`${project.main}`)
    const mainWollokProgramName = programWollokFile.members.find(entity => entity.is('Program'))?.name
    const { buildEvaluation, runProgram } = interpret(environment, natives)
    const cleanEval = buildEvaluation()
    runProgram(`${project.main}.${mainWollokProgramName}`, cleanEval)
    setGame(project)
    setEvaluation(cleanEval)
  }

  const title = evaluation ? evaluation.instance(gameInstance(evaluation).get('title')!.id).innerValue : ''

  return (
    <div className={$.container}>
      {!evaluation || !game
        ? <FilesSelector cb={loadGame} {...props} />
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

const defaultImgs = [
  DEFAULT_GAME_ASSETS_DIR + 'ground.png',
  DEFAULT_GAME_ASSETS_DIR + 'wko.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech2.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech3.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech4.png',
]

function buildGameProject(files: File[]): GameProject {
  const repoUri = new URLSearchParams(document.location.search).get('git')?.replace('https://github.com/', '') //TODO: Arreglar las imágenes para evitar esto, sino no va a andar con proyectos locales

  const wpgmFile = files.find(withExtension(WOLLOK_PROGRAM_EXTENSION))
  if (!wpgmFile) throw new Error('Program not found')
  const main = wpgmFile.name.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').replace(/\//gi, '.')
  const sources = files.filter(withExtension(...EXPECTED_WOLLOK_EXTENSIONS)).map(({ name, content }) => ({ name, content: content.toString('utf8') }))
  const assetSource = `https://raw.githubusercontent.com/${repoUri}/master/`
  const gameAssetsPaths = files.filter(withExtension(...VALID_IMAGE_EXTENSIONS)).map(({ name }) => assetSource + name)
  const assetFolderName = gameAssetsPaths[0]?.substring(assetSource.length).split('/')[0]
  const assetsDir = assetSource + assetFolderName + '/'
  const imagePaths = gameAssetsPaths.concat(defaultImagesNeededFor(gameAssetsPaths))
  const description = files.find(withExtension('md'))?.content.toString('utf8') || '## No description found'

  return { main, sources, description, imagePaths, assetsDir }
}

function defaultImagesNeededFor(imagePaths: string[]): string[] {
  const imageNameInPath = (path: string) => { return path.split('/').pop()! }
  const knownImageNames = imagePaths.map(path => imageNameInPath(path))
  return defaultImgs.filter(defaultImg => !knownImageNames.includes(imageNameInPath(defaultImg)))
}

const withExtension = (...extensions: string[]) => ({ name }: File) =>
  extensions.some(extension => name.endsWith(`.${extension}`))