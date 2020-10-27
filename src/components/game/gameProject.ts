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
const CLASS_PATH_FILE = 'classpath'

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

export const buildGameProject = (files: File[]): GameProject => {
  const wpgmFile = files.find(withExtension(WOLLOK_PROGRAM_EXTENSION))
  if (!wpgmFile) throw new Error('Program file not found')
  const main = wpgmFile.name.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').replace(/\//gi, '.')
  const sources = files.filter(withExtension(...EXPECTED_WOLLOK_EXTENSIONS)).map(({ name, content }) => ({ name, content: content.toString('utf8') }))
  const description = files.find(withExtension('md'))?.content.toString('utf8') || '## No description found'

  const images = getMediaFilesWithExtension(files, VALID_IMAGE_EXTENSIONS, 'image/png')
  const sounds = getMediaFilesWithExtension(files, VALID_SOUND_EXTENSIONS, 'audio/mp3')

  return { main, sources, description, images, sounds }
}

function getMediaFilesWithExtension(files: File[], validExtensions: string[], type: string): MediaFile[] {
  const mediaFiles = files.filter(withExtension(...validExtensions))
  return mediaFiles.map(({ name, content }) => (
    {
      path: filePathWithoutSource(name, getSourceFoldersNames(files)),
      url: URL.createObjectURL(new Blob([content], { type: type })),
    }
  ))
}

function filePathWithoutSource(filePath: string, sourcePaths: string[]) {
  const sourcePath: string = sourcePaths.filter((source: string) => filePath.startsWith(source)).sort((sourceA, sourceB) => sourceB.length - sourceA.length)[0]
  return filePath.substring(sourcePath.length + 1)
}

function getSourceFoldersNames(files: File[]): string[] {
  const classPathContent: string = files.find(withExtension(CLASS_PATH_FILE))!.content.toString('utf8')
  const document: parse.Document = parse(classPathContent)
  const documentAttributes: Attributes[] = document.root.children.map(child => child.attributes)
  return documentAttributes.filter((attribute: Attributes) => attribute.kind === 'src').map((attribute: Attributes) => attribute.path)
}


const withExtension = (...extensions: string[]) => ({ name }: File) =>
  extensions.some(extension => name.endsWith(`.${extension}`))