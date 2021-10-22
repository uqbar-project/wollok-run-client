import React, { memo, useState, useEffect } from 'react'
import { LoadingError, SelectorProps } from './FilesSelector'
import * as BrowserFS from 'browserfs'
import { clone } from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import $ from './FilesSelector.module.scss'

const DEFAULT_GAME_URI = 'https://github.com/wollok/pepitagame'
const GIT = 'git'
let fs: any

type GitSelectorProps = SelectorProps & { onFailureDo: (error: LoadingError) => void }

export function loadGitRepo(url: string) {
  setGitSearch(url)
}

export function clearGitRepo() {
  setGitSearch()
}

export function clearURL() {
  const search = document.location.search
  window.history.pushState({}, '', search.split(GIT)[0]);
}

const setGitSearch = (url?: string) => {
  const search = document.location.search
  let newSearch
  if (typeof URLSearchParams !== 'undefined') {
    const params = new URLSearchParams(search)
    if (!url) {
      params.delete(GIT)
    } else {
      params.set(GIT, url)
    }
    newSearch = params.toString()
  }
  else {
    // Internet explorer does not support URLSearchParams
    if (!url) {
      newSearch = search.split(GIT)[0]
    } else {
      newSearch = `${GIT}=${url}`
    }
  }
  document.location.search = newSearch
}

const loadGitFiles = ({ onFilesLoad, onStartLoad }: SelectorProps) => async (repoUrl: string) => {
  const corsProxy = process.env.REACT_APP_PROXY_URL || 'http://localhost:9999'
  onStartLoad()
  await clone({
    fs, http,
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
  const [gitUrl, setGitUrl] = useState<string>()
  const repoUri = new URLSearchParams(document.location.search).get(GIT)

  const repoNotFoundError = () => {
    const error = {
      title: 'Repositorio no encontrado',
      description: 'No pudimos encontrar el repo que indicaste. Asegurate de que exista y sea público.',
      children: <div style={{ textAlign: 'center' }}><a href={repoUri!} target="_blank" rel="noreferrer noopener" style={{ color: 'white', fontSize: 16 }}>Link al repositorio</a></div>,
    }

    return error
  }

  useEffect(() => {
    BrowserFS.configure({ fs: 'InMemory', options: {} }, (err: any) => {
      if (err) throw new Error('FS error')
      fs = BrowserFS.BFSRequire('fs')
      if (repoUri) loadGitFiles(props)(repoUri).catch(() => props.onFailureDo(repoNotFoundError()))
    })
  }, [props, repoUri])

  const navigateToGame = () => {
    loadGitRepo(gitUrl || DEFAULT_GAME_URI)
  }

  return (
    <div className={$.selector}>
      <form onSubmit={event => { event.preventDefault(); navigateToGame() }}>
        <div>
          <label>Pegá la URL del repositorio del juego a correr</label>
          <input type='text' placeholder={DEFAULT_GAME_URI} onChange={event => setGitUrl(event.target.value)} />
        </div>
        <button type='submit'>Cargar Juego</button>
      </form>
    </div>
  )
}

export default memo(GitSelector)