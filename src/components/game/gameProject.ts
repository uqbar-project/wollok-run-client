import { File } from '../filesSelector/FilesSelector'
import { Environment } from 'wollok-ts/dist'
import parse, { Attributes } from 'xml-parser'

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
  path: string;
  url: string;
}
export interface GameProject {
  main: string;
  sources: SourceFile[];
  description: string;
  images: MediaFile[];
  sounds: MediaFile[];
}

export const mainProgram = ({ main }: GameProject, environment: Environment): string => {
  const programWollokFile = environment.getNodeByFQN<'Package'>(main)
  const wollokProgram = programWollokFile.members.find(entity => entity.is('Program'))
  if (!wollokProgram) throw new Error('Program not found')
  return `${main}.${wollokProgram.name}`
}

export const buildGameProject = (allFiles: File[]): GameProject => {
  const sourceFiles = getAllSourceFiles(allFiles)

  const wpgmFile = sourceFiles.find(withExtension(WOLLOK_PROGRAM_EXTENSION))
  if (!wpgmFile) throw new Error('Program file not found')
  const main = wpgmFile.name.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').replace(/\//gi, '.')
  const wollokFiles = sourceFiles.filter(withExtension(...EXPECTED_WOLLOK_EXTENSIONS)).map(({ name, content }) => ({ name, content: content.toString('utf8') }))
  const description = allFiles.find(withExtension('md'))?.content.toString('utf8') || '## No description found'

  const images = getMediaFiles(sourceFiles, VALID_IMAGE_EXTENSIONS, 'image/png', getSourcePaths(allFiles))
  const sounds = getMediaFiles(sourceFiles, VALID_SOUND_EXTENSIONS, 'audio/mp3', getSourcePaths(allFiles))

  return { main, sources: wollokFiles, description, images, sounds }
}

function getMediaFiles(sourceFiles: File[], validExtensions: string[], type: string, sourcePaths: string[]): MediaFile[] {
  const mediaFiles = sourceFiles.filter(withExtension(...validExtensions))
  return mediaFiles.map(({ name, content }) => (
    {
      path: filePathWithoutSource(name, sourcePaths),
      url: URL.createObjectURL(new Blob([content], { type: type })),
    }
  ))
}

function getAllSourceFiles(files: File[]): File[] {
  return files.filter(({ name }) => getSourcePaths(files).some((sourcePath: string) => name.startsWith(sourcePath)))
}

function filePathWithoutSource(filePath: string, sourcePaths: string[]): string {
  const sourcePath: string = sourcePaths.find((source: string) => filePath.startsWith(source))!
  return filePath.substring(sourcePath.length + 1)
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
  return sourceFolderNames.map((sourceName: string) => getRootPath(files) + sourceName)
}

function getClasspathFile(files: File[]): File {
  return files.find(withExtension(CLASSPATH_NAME))!
}

const withExtension = (...extensions: string[]) => ({ name }: File) =>
  extensions.some(extension => name.endsWith(`.${extension}`))