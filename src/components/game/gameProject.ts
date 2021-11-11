import { File } from '../filesSelector/FilesSelector'
import { Environment, Node, Package } from 'wollok-ts'
import parse, { Attributes } from 'xml-parser'
import { name } from 'wollok-ts/dist/parser'

// TODO: Move to more general place
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
const VALID_SOUND_EXTENSIONS = ['mp3', 'ogg', 'wav']
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'
const CLASSPATH_NAME = 'classpath'

// TODO: Move to Wollok-TS
interface SourceFile {
  name: string;
  content: string;
}

interface MediaFile {
  possiblePaths: string[];
  url: string;
}
export interface GameProject {
  main: string;
  sources: SourceFile[];
  description: string;
  images: MediaFile[];
  sounds: MediaFile[];
}

export class MultiProgramException extends Error {

  wpgmFiles: Array<File | SourceFile> = []
  files: Array<File> = []

  constructor(msg: string, programs: Array<File | SourceFile>, files: Array<File>) {
    super(msg)
    this.wpgmFiles = programs
    this.files = files
  }

}

export class NoProgramException extends Error { }

export const getProgramIn = (packageFQN: string, environment: Environment): Node => {
  const programWollokFile = environment.getNodeByFQN<Package>(packageFQN)
  const wollokProgram = programWollokFile.members.find(entity => entity.is('Program'))
  if (!wollokProgram) throw new NoProgramException('Program not found')
  return wollokProgram
}

export const buildGameProject = (allFiles: File[], programName?: string): GameProject => {
  const wollokFiles = getAllSourceFiles(allFiles).filter(withExtension(...EXPECTED_WOLLOK_EXTENSIONS)).map(normalizeWollokFile)
  let wpgmFiles: Array<File | SourceFile> = []
  let wpgmFile

  if(programName)
    wpgmFile = wollokFiles.find(file => file.name === programName)
  else
    wpgmFiles = wollokFiles.filter(withExtension(WOLLOK_PROGRAM_EXTENSION))
  if (wpgmFiles.length > 1) throw new MultiProgramException('This project has more than one program', wpgmFiles, allFiles)
  if (wpgmFiles.length === 1) wpgmFile = wpgmFiles[0]
  if (!wpgmFile) throw new NoProgramException('Program file not found')
  const main = wpgmFile.name.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').replace(/\//gi, '.')
  const description = allFiles.find(isREADME())?.content.toString('utf8') || '## No description found'
  const images = getMediaFiles(allFiles, VALID_IMAGE_EXTENSIONS, 'image/png')
  const sounds = getMediaFiles(allFiles, VALID_SOUND_EXTENSIONS, 'audio/mp3')

  return { main, sources: wollokFiles, description, images, sounds }
}

function getMediaFiles(allFiles: File[], validExtensions: string[], type: string): MediaFile[] {
  const mediaFiles = allFiles.filter(withExtension(...validExtensions))
  const mediaSourcePaths = getSourcePaths(allFiles).concat(getRootPath(allFiles))
  return mediaFiles.map(({ name, content }) => (
    {
      possiblePaths: possiblePathsToFile(name, mediaSourcePaths),
      url: URL.createObjectURL(new Blob([content], { type: type })),
    }
  ))
}

function getAllSourceFiles(files: File[]): File[] {
  return files.filter(({ name }) => getSourcePaths(files).some((sourcePath: string) => name.startsWith(sourcePath)))
}

function possiblePathsToFile(filePath: string, sourcePaths: string[]): string[] {
  const possibleSources: string[] = sourcePaths.filter((source: string) => filePath.startsWith(source))!
  return possibleSources.map((sourcePath: string) => filePath.substring(sourcePath.length))
}

function getRootPath(files: File[]): string {
  const classpathPath: string = getClasspathFile(files).name
  return classpathPath.split(`.${CLASSPATH_NAME}`)[0]
}


function getSourcePaths(files: File[]): string[] {
  const classPathContent: string = getClasspathFile(files).content.toString('utf8')
  const document: parse.Document = parse(classPathContent)
  const documentAttributes: Attributes[] = document.root.children.map(child => child.attributes)
  const sourceFolderNames = documentAttributes.filter((attribute: Attributes) => attribute.kind === 'src').map((attribute: Attributes) => attribute.path)
  return sourceFolderNames.map((sourceName: string) => `${getRootPath(files)}${sourceName}/`)
}

function getClasspathFile(files: File[]): File {
  return files.find(withExtension(CLASSPATH_NAME))!
}

const isREADME = () => ({ name }: File | SourceFile) => name.endsWith('README.md')

const withExtension = (...extensions: string[]) => ({ name }: File | SourceFile) =>
  extensions.some(extension => name.endsWith(`.${extension}`))

/**
 * Workaroud for:
 * https://github.com/uqbar-project/wollok-ts/issues/72
 * https://github.com/uqbar-project/wollok-language/issues/31
 */
const normalizeWollokFile = ({ name, content }: File) => ({
  name: name.replace('game.wpgm', '_juego_.wpgm'),
  content: content.toString('utf8').replace(/\+\+/g, '+=1').replace(/--/g, '-=1').replace('program game', 'program _juego_'),
})