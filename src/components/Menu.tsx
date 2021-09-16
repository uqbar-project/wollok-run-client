import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MenuIcon from '@material-ui/icons/Menu'
import ReplayIcon from '@material-ui/icons/Replay'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import PauseCircleFilledIcon from '@material-ui/icons/PauseCircleFilled'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled'

type MenuProps = {
  restart: () => void
  exit: () => void
  toggleAudio: () => void
  togglePause: () => void
}

export default function SimpleMenu(props: MenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mute, setMute] = useState(false)
  const [pause, setPause] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const toggleAudio = () => {
    setMute(!mute)
  }

  const togglePause = () => {
    setPause(!pause)
  }

  const AudioItem = () => {
    if(mute) {
      return <><VolumeUpIcon /> Reanudar música</>
    }
    return <><VolumeOffIcon /> Pausar música</>
  }

  const TogglePauseItem = () => {
    if(pause) {
      return <><PlayCircleFilledIcon /> Reanudar juego</>
    }
    return <><PauseCircleFilledIcon /> Pausar juego</>
  }

  return (
    <div>
      <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} variant="contained" color="primary">
        <MenuIcon />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={event => { event.preventDefault(); props.togglePause(); togglePause(); setAnchorEl(null) }}>
          <TogglePauseItem />
        </MenuItem> 
        <MenuItem onClick={event => { event.preventDefault(); props.toggleAudio(); toggleAudio(); setAnchorEl(null) }}>
          <AudioItem/>
        </MenuItem>
        <MenuItem onClick={event => { event.preventDefault(); props.restart(); setAnchorEl(null) }}>
          <ReplayIcon />Reiniciar juego
        </MenuItem>
        <MenuItem onClick={event => { event.preventDefault(); props.exit(); setAnchorEl(null) }}>
          <PlaylistPlayIcon /> Elegir juego
        </MenuItem>
      </Menu>
    </div>
  )
}