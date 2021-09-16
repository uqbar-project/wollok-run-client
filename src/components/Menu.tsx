import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MenuIcon from '@material-ui/icons/Menu'
import ReplayIcon from '@material-ui/icons/Replay'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import VolumeOffIcon from '@material-ui/icons/VolumeOff'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
// import PauseIcon from '@material-ui/icons/Pause'
// import PlayArrowIcon from '@material-ui/icons/PlayArrow'

type MenuProps = {
  restart: () => void
  exit: () => void
  toggleAudio: () => void
}

export default function SimpleMenu(props: MenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [mute, setMute] = useState(false)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const toggleAudio = () => {
    setMute(!mute)
  }

  const AudioItem = () => {
    if(mute) {
      return <><VolumeUpIcon /> Reanudar música</>
    }
    return <><VolumeOffIcon /> Pausar música</>
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
        <MenuItem onClick={event => { event.preventDefault(); props.restart(); setAnchorEl(null) }}>
          <ReplayIcon />Reiniciar juego
        </MenuItem>
        <MenuItem onClick={event => { event.preventDefault(); props.exit(); setAnchorEl(null) }}>
          <PlaylistPlayIcon /> Elegir juego
        </MenuItem>
        <MenuItem onClick={event => { event.preventDefault(); props.toggleAudio(); toggleAudio(); setAnchorEl(null) }}>
          <AudioItem/>
        </MenuItem>
        {/* <MenuItem onClick={handleClose}>
            <PauseIcon />Pausar juego
          </MenuItem>
           */}
      </Menu>
    </div>
  )
}