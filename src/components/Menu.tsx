import React, { useContext, useState } from 'react'
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
import { SketchContext } from '../context/SketchContext'
// import { ModalFileSelector } from './ModalFileSelector'

type MenuProps = {
  restart: () => void
  exit: () => void
  gameDescription: string
}

export default function SimpleMenu(props: MenuProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const { audioMuted, gamePaused, menuSize, toggleAudio, togglePause } = useContext(SketchContext)

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
    if(audioMuted) {
      return <>
        <Tooltip title="Reanudar audio">
          <VolumeOffIcon />
        </Tooltip>
      </>
    }
    return <>
      <Tooltip title="Silenciar audio">
        <VolumeUpIcon />
      </Tooltip>
    </>
  }

  const TogglePauseItem = () => {
    if(gamePaused) {
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
      <AppBar className={$.navContainer} position="static" style={{ height: `${menuSize}vh` }}>
        <Toolbar className={$.toolbar}>
          <DrawerReadme description={props.gameDescription} >
            <Tooltip title="Abrir README">
              <MenuBookIcon />
            </Tooltip>
          </DrawerReadme>
          <IconButton onClick={event => { event.preventDefault(); togglePause() }}>
            <TogglePauseItem />
          </IconButton>
          <IconButton onClick={event => { event.preventDefault(); toggleAudio() }}>
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