import React, { memo, useState, useEffect, useContext } from 'react'
import { LoadFilesType, LoadingError, SelectorProps } from './FilesSelector'
import * as BrowserFS from 'browserfs'
import { clone } from 'isomorphic-git'
import http from 'isomorphic-git/http/web'
import $ from './FilesSelector.module.scss'
import { GameContext } from '../../context/GameContext'
import { Link } from '@reach/router'
import { useHistory } from "react-router-dom"

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
    newSearch = decodeURIComponent(params.toString())
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

const loadGitFiles = ({ onFilesLoad, onStartLoad }: LoadFilesType) => async (repoUrl: string) => {
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
  const { loadGame } = useContext(GameContext)
  const history = useHistory()


  const repoNotFoundError = () => {
    const error = {
      title: 'Repositorio no encontrado',
      description: 'No pudimos encontrar el repo que indicaste. Asegurate de que exista y sea público.',
      children: <div style={{ textAlign: 'center' }}><a href={repoUri!} target="_blank" rel="noreferrer noopener" style={{ color: 'white', fontSize: 16 }}>Link al repositorio</a></div>,
    }

    return error
  }



  const navigateToGame = () => {
    console.log("navegamos")
    console.log(history)
    //history.push('/game/running')
    const repoUri = gitUrl || DEFAULT_GAME_URI
    //loadGitRepo(repoUri)
    BrowserFS.configure({ fs: 'InMemory', options: {} }, (err: any) => {
      if (err) throw new Error('FS error')
      fs = BrowserFS.BFSRequire('fs')
      loadGitFiles({...props, onFilesLoad: loadGame})(repoUri)
      .then(() => history.push('/game/running'))
      .then(() => loadGitRepo(repoUri))
      .catch(() => props.onFailureDo(repoNotFoundError()))
    })
  }

  return (
    <div className={$.selector}>
      <form onSubmit={event => { event.preventDefault(); navigateToGame() }}>
        <div>
          <label>Pegá la URL del repositorio del juego a correr</label>
          <input type='text' placeholder={DEFAULT_GAME_URI} onChange={event => setGitUrl(event.target.value)} />
        </div>
        <button className="$.selector" type="submit">
        </button>
      </form>
    </div>
  )
}

export default memo(GitSelector)

