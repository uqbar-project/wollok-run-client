import React, { memo, useState, useEffect } from 'react'
import { SelectorProps } from './FilesSelector'
import * as BrowserFS from 'browserfs'
import * as git from 'isomorphic-git'
import $ from './FilesSelector.module.scss'

const GIT = 'git'

type GitSelectorProps = SelectorProps & { onFailureDo: () => void }


const loadGitFiles = ({ onFilesLoad, onStartLoad }: SelectorProps) => async (repoUrl: string) => {
  const corsProxy = process.env.REACT_APP_PROXY_URL || 'http://localhost:9999'
  onStartLoad()
  await git.clone({
    dir: GIT,
    corsProxy,
    url: repoUrl,
    singleBranch: true,
    depth: 1,
  })
  const files = getAllFilePathsFrom(GIT).map(fetchFile)
  onFilesLoad(files)
}

const fetchFile = (path: string) => {
  return {
    name: path.replace('git/', ''),
    content: BrowserFS.BFSRequire('fs').readFileSync(path),
  }
}


const getAllFilePathsFrom = (rootDirectory: string): string[] => {
  const browserFS = BrowserFS.BFSRequire('fs')
  return browserFS
    .readdirSync(rootDirectory)
    .map((directoryEntry: string) => {
      const fullPath = `${rootDirectory}/${directoryEntry}`
      return browserFS.statSync(fullPath).isDirectory() ?
        getAllFilePathsFrom(fullPath) : fullPath
    })
    .flat()
}


const GitSelector = (props: GitSelectorProps) => {
  const defaultGameUri = 'https://github.com/wollok/pepitagame'
  const [gitUrl, setGitUrl] = useState<string>()
  const repoUri = new URLSearchParams(document.location.search).get(GIT)

  useEffect(() => {
    BrowserFS.configure({ fs: 'InMemory', options: {} }, (err: any) => {
      if (err) throw new Error('FS error')
      git.plugins.set('fs', BrowserFS.BFSRequire('fs'))
      if (repoUri) loadGitFiles(props)(repoUri).catch(props.onFailureDo)
    })
  }, [props, repoUri])

  const navigateToGame = () => {
    document.location.search = `${GIT}=${gitUrl || defaultGameUri}`
  }

  return (
    <div className={$.selector}>
      <form onSubmit={event => { event.preventDefault(); navigateToGame() }}>
        <div>
          <label>Pegá la URL del repositorio del juego a correr</label>
          <input type='text' placeholder={defaultGameUri} onChange={event => setGitUrl(event.target.value)} />
        </div>
        <button type='submit'>Cargar Juego</button>
      </form>
    </div>
  )
}

export default memo(GitSelector)