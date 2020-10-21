import { File } from '../filesSelector/FilesSelector'
import { Environment } from 'wollok-ts/dist'

// TODO: Move to more general place
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'

// TODO: Move to Wollok-TS
interface SourceFile {
  name: string;
  content: string;
}

export interface GameProject {
  main: string;
  sources: SourceFile[];
  description: string;
  assetsDir: string;
  images: { path: string; imageUrl: string }[];
}

export const mainProgram = ({ main }: GameProject, environment: Environment): string => {
  const programWollokFile = environment.getNodeByFQN<'Package'>(main)
  const wollokProgram = programWollokFile.members.find(entity => entity.is('Program'))
  if (!wollokProgram) throw new Error('Program not found')
  return `${main}.${wollokProgram.name}`
}

export const buildGameProject = (files: File[]): GameProject => {
  const repoUri = new URLSearchParams(document.location.search).get('git')?.replace('https://github.com/', '') //TODO: Arreglar las imágenes para evitar esto, sino no va a andar con proyectos locales

  const wpgmFile = files.find(withExtension(WOLLOK_PROGRAM_EXTENSION))
  if (!wpgmFile) throw new Error('Program file not found')
  const main = wpgmFile.name.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').replace(/\//gi, '.')
  const sources = files.filter(withExtension(...EXPECTED_WOLLOK_EXTENSIONS)).map(({ name, content }) => ({ name, content: content.toString('utf8') }))
  const assetSource = `https://raw.githubusercontent.com/${repoUri}/master/`
  const imgFiles = files.filter(withExtension(...VALID_IMAGE_EXTENSIONS))
  const gameAssetsPaths = imgFiles.map(({ name }) => assetSource + name)
  const assetFolderName = gameAssetsPaths[0]?.substring(assetSource.length).split('/')[0] //TODO: Esto no está bien
  const assetsDir = assetSource + assetFolderName + '/'
  const description = files.find(withExtension('md'))?.content.toString('utf8') || '## No description found'
  const images = imgFiles.map(({ name, content }) => (
    {
      path: name.split('/').pop()!, //TODO: Contemplar sub-directorios
      imageUrl: URL.createObjectURL(new Blob([content], { type: 'image/png' })),
    }
  ))

  return { main, sources, description, assetsDir, images }
}

const withExtension = (...extensions: string[]) => ({ name }: File) =>
  extensions.some(extension => name.endsWith(`.${extension}`))