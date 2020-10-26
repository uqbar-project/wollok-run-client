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
import { buildGameProject, getClassPathPath, filesWithValidSuffixes } from './gameProject'

const natives = wre as Natives
export const GAME_DIR = 'game'

const fetchFile = (path: string) => {
  return {
    name: path,
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

export function getFileContent(filePath: string): string {
  return BrowserFS.BFSRequire('fs').readFileSync(filePath).toString()
}

export function getSourceFoldersNames(): string[] {
  const classPathContent: string = BrowserFS.BFSRequire('fs').readFileSync(getClassPathPath(), 'utf-8')
  const document: parse.Document = parse(classPathContent)
  const documentAttributes: Attributes[] = document.root.children.map(child => child.attributes)
  return documentAttributes.filter((attribute: Attributes) => attribute.kind === 'src').map((attribute: Attributes) => attribute.path)
}


export function getAllFilePathsFrom(parentDirectory: string, validSuffixes?: string[]): string[] {
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