import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MenuIcon from '@material-ui/icons/Menu'
import ReplayIcon from '@material-ui/icons/Replay'
import PlaylistPlayIcon from '@material-ui/icons/PlaylistPlay'
import MenuBookIcon from '@material-ui/icons/MenuBook'
import { DrawerReadme } from './DrawerReadme'
// import VolumeOffIcon from '@material-ui/icons/VolumeOff'
// import VolumeUpIcon from '@material-ui/icons/VolumeUp'
// import PauseIcon from '@material-ui/icons/Pause'
// import PlayArrowIcon from '@material-ui/icons/PlayArrow'

type MenuProps = {
  restart: () => void
  exit: () => void
  gameDescription: string
}

export default function SimpleMenu(props: MenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
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
        <DrawerReadme description={props.gameDescription} close={handleClose} >
          <MenuBookIcon /> Abrir Readme
        </DrawerReadme>
        {/* <MenuItem onClick={handleClose}>
            <PauseIcon />Pausar juego
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <VolumeOffIcon /> Pausar música
          </MenuItem> */}
      </Menu>
    </div>
  )
}