import { GameProject, getFileContent, getSourceFoldersNames, getAllFilePathsFrom, GAME_DIR } from './Game'

const VALID_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
const VALID_SOUND_EXTENSIONS = ['mp3', 'ogg', 'wav']
const WOLLOK_FILE_EXTENSION = 'wlk'
const WOLLOK_PROGRAM_EXTENSION = 'wpgm'
const EXPECTED_WOLLOK_EXTENSIONS = [WOLLOK_FILE_EXTENSION, WOLLOK_PROGRAM_EXTENSION]
export const CLASS_PATH_FILE = '.classpath'
export const DEFAULT_GAME_ASSETS_DIR = 'https://raw.githubusercontent.com/uqbar-project/wollok/dev/org.uqbar.project.wollok.game/assets/'

const defaultImgs = [
  DEFAULT_GAME_ASSETS_DIR + 'ground.png',
  DEFAULT_GAME_ASSETS_DIR + 'wko.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech2.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech3.png',
  DEFAULT_GAME_ASSETS_DIR + 'speech4.png',
]


export function buildGameProject(repoUri: string): GameProject {
  const allFilesPaths: string[] = getAllSourceFiles()
  const wpgmGamePath = allFilesPaths.find((file: string) => file.endsWith(`.${WOLLOK_PROGRAM_EXTENSION}`))
  if (!wpgmGamePath)
    throw new Error('Program not found')
  const mainFQN: string = wpgmGamePath.replace(`.${WOLLOK_PROGRAM_EXTENSION}`, '').replace(/\//gi, '.')
  const wollokFilesPaths: string[] = filesWithValidSuffixes(allFilesPaths, EXPECTED_WOLLOK_EXTENSIONS)
  const assetsRootPath = `https://raw.githubusercontent.com/${repoUri}/master/`
  const knownImagePaths = assetsWithValidSuffixes(allFilesPaths, assetsRootPath, VALID_IMAGE_EXTENSIONS)
  const imagePaths = knownImagePaths.concat(defaultImagesNeededFor(knownImagePaths))
  const soundPaths = assetsWithValidSuffixes(allFilesPaths, assetsRootPath, VALID_SOUND_EXTENSIONS)
  const sourcePaths = getAssetsSourceFoldersPaths(assetsRootPath)
  const description = getProjectDescription()
  return { main: mainFQN, sources: wollokFilesPaths, description, imagePaths, soundPaths, sourcePaths }
}
function getProjectDescription(): string {
  try {
    return getFileContent(`${getGameRootPath()}/README.md`)
  }
  catch {
    return '## No description found'
  }
}
function getAssetsSourceFoldersPaths(assetsRootPath: string): string[] {
  return getSourceFoldersNames().map((source: string) => assetsRootPath + source)
}
export function getAllSourceFiles(): string[] {
  return getSourceFoldersNames().flatMap((source: string) => getAllFilePathsFrom(`${getGameRootPath()}/${source}`))
}
function assetsWithValidSuffixes(files: string[], rootPath: string, validSuffixes: string[]): string[] {
  return filesWithValidSuffixes(files, validSuffixes).map(path => rootPath + path.substr(getGameRootPath().length + 1))
}
export function getGameRootPath(): string {
  return getClassPathPath().split(`/${CLASS_PATH_FILE}`)[0]
}
export function getClassPathPath(): string {
  const allFiles = getAllFilePathsFrom(GAME_DIR, ['classpath'])
  return allFiles.find((filePath: string) => filePath.endsWith(`/${CLASS_PATH_FILE}`))!
}
function defaultImagesNeededFor(imagePaths: string[]): string[] {
  const imageNameInPath = (path: string) => path.split('/').pop()!
  const knownImageNames = imagePaths.map(path => imageNameInPath(path))
  return defaultImgs.filter(defaultImg => !knownImageNames.includes(imageNameInPath(defaultImg)))
}
export function filesWithValidSuffixes(files: string[], validSuffixes: string[]): string[] {
  return files.filter((file: string) => validSuffixes.some(suffix => file.endsWith(`.${suffix}`)))
}