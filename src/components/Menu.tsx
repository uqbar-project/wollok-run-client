import React, { useState } from 'react'
import ReplayIcon from '@material-ui/icons/Replay'
import CloseIcon from '@material-ui/icons/Close'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
// import PublishIcon from '@material-ui/icons/Publish'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import { DrawerReadme } from './DrawerReadme'
import { AppBar, IconButton, Toolbar, Tooltip } from '@material-ui/core'
import $ from './Menu.module.scss'
// import { ModalFileSelector } from './ModalFileSelector'

type MenuProps = {
  restart: () => void
  exit: () => void
  toggleAudio: () => void
  togglePause: () => void
  gameDescription: string
  menuSize: number
}

export default function SimpleMenu(props: MenuProps) {
  const [mute, setMute] = useState(false)
  const [pause, setPause] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const toggleAudio = () => {
    setMute(!mute)
  }

  const togglePause = () => {
    setPause(!pause)
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement === null) {
      document.documentElement.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
    setFullscreen(!fullscreen)
  }

  const AudioItem = () => {
    if(mute) {
      return <>
        <Tooltip title="Reanudar audio">
          <VolumeUpIcon />
        </Tooltip>
      </>
    }
    return <>
      <Tooltip title="Silenciar audio">
        <VolumeOffIcon />
      </Tooltip>
    </>
  }

  const TogglePauseItem = () => {
    if(pause) {
      return <>
        <Tooltip title="Reanudar juego">
          <PlayCircleFilledIcon />
        </Tooltip>
      </>
    }
    return <>
      <Tooltip title="Pausar juego">
        <PauseCircleFilledIcon />
      </Tooltip>
    </>
  }

  const FullscreenItem = () => {
    if(fullscreen) {
      return <>
        <Tooltip title="Salir de pantalla completa">
          <FullscreenExitIcon />
        </Tooltip>
      </>
    }
    return <>
      <Tooltip title="Pantalla completa">
        <FullscreenIcon />
      </Tooltip>
    </>
  }

  return (
    <div>
      <AppBar className={$.navContainer} position="static" style={{ height: `${props.menuSize}vh` }}>
        <Toolbar className={$.toolbar}>
          <DrawerReadme description={props.gameDescription} >
            <Tooltip title="Abrir README">
              <MenuBookIcon />
            </Tooltip>
          </DrawerReadme>
          <IconButton onClick={event => { event.preventDefault(); props.togglePause(); togglePause() }}>
            <TogglePauseItem />
          </IconButton>
          <IconButton onClick={event => { event.preventDefault(); props.toggleAudio(); toggleAudio() }}>
            <AudioItem/>
          </IconButton>
          {/* <ModalFileSelector>
            <Tooltip title="Cargar juego">
              <PublishIcon />
            </Tooltip>
          </ModalFileSelector> */}
          <IconButton onClick={event => { event.preventDefault(); toggleFullscreen() }}>
            <FullscreenItem/>
          </IconButton>
          <IconButton onClick={event => { event.preventDefault(); props.restart() }}>
            <Tooltip title="Reiniciar juego">
              <ReplayIcon />
            </Tooltip>
          </IconButton>
          <IconButton onClick={event => { event.preventDefault(); props.exit() }}>
            <Tooltip title="Cerrar juego">
              <CloseIcon />
            </Tooltip>
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  )
}