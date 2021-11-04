import React, { ReactNode, useState } from 'react'
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

//Buttons id's
const pauseID = 'pauseID'
const audioID = 'audioID'
const fullscreenID = 'fullscreenID'
const restartGameID = 'restartGameID'

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
          <MenuButton id={pauseID} action={ () => { props.togglePause(); togglePause() }}>
            <TogglePauseItem />
          </MenuButton>
          <MenuButton id={audioID} action={ () => { props.toggleAudio(); toggleAudio() }}>
            <AudioItem/>
          </MenuButton>
          {/* <ModalFileSelector>
            <Tooltip title="Cargar juego">
              <PublishIcon />
            </Tooltip>
          </ModalFileSelector> */}
          <MenuButton id={fullscreenID} action={ toggleFullscreen }>
            <FullscreenItem/>
          </MenuButton>
          <MenuButton id={restartGameID} action={ props.restart }>
            <Tooltip title="Reiniciar juego">
              <ReplayIcon />
            </Tooltip>
          </MenuButton>
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

interface MenuButtonProps{
  id: string
  action: () => void
  style?: { color: string }
  children: ReactNode
}

export const MenuButton = ({ id, action, style, children }: MenuButtonProps) => {
  return(
    <IconButton id={id} style={style} onClick={event => { buttonStuff(event, pauseID); action() }}>
      { children }
    </IconButton>
  )
}

export function unselectButton(button: string) {
  document.getElementById(button)?.blur()
}

function buttonStuff(event: React.MouseEvent, button: string) {
  event.preventDefault()
  unselectButton(button)
}